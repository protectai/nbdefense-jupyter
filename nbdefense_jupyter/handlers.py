import os
import requests
from pathlib import Path
import tempfile
import asyncio
import functools
import concurrent.futures
import json

from jupyter_server.utils import url_path_join
from nbdefense.constants import DEFAULT_SETTINGS
import tornado

from nbdefense.nbdefense import NBDefense

from nbdefense_jupyter._version import __version__

PRODUCT_NAME = "NBDefenseJLE"


AUTH_HEADERS = {"content-type": "application/x-www-form-urlencoded"}

JLE_PLUGINS = [
    "nbdefense.plugins.PIIPlugin",
    "nbdefense.plugins.SecretsPlugin",
    "nbdefense.plugins.LicenseNotebookPlugin",
    "nbdefense.plugins.CVENotebookPlugin",
]


class NBDefenseWSRouteHandler(tornado.websocket.WebSocketHandler):
    async def on_message(self, message):
        try:
            data = json.loads(message)
            site_packages_path = None
            if "sitePackagesPath" in data:
                site_packages_path = data["sitePackagesPath"].strip()
            if "fullNotebookPath" in data and "notebookPath" in data:
                with concurrent.futures.ProcessPoolExecutor() as pool:
                    report = await asyncio.get_event_loop().run_in_executor(
                        pool,
                        functools.partial(
                            NBDefense.scan,
                            root=os.path.expanduser(data["fullNotebookPath"]),
                            recursive=False,
                            quiet=False,
                            requirements_file=None,
                            report_format="json",
                            yes=True,
                            temp_directory=Path(tempfile.gettempdir())
                            / "nbdefense_tmp/",
                            plugins_to_load=JLE_PLUGINS,
                            site_packages_path=site_packages_path,
                            settings={
                                **DEFAULT_SETTINGS,
                                **data.get("scanSettings", {}),
                            },
                        ),
                    )
                    self.write_message(
                        {
                            "notebookPath": data["notebookPath"],
                            "report": json.loads(report),
                        }
                    )
        except requests.exceptions.HTTPError as e:
            self.write_message(
                {
                    "notebookPath": data["notebookPath"],
                    "errorType": "HTTPError",
                    "statusCode": e.response.status_code,
                    "message": e.response.reason,
                }
            )
        except Exception as e:
            self.write_message(
                {
                    "notebookPath": data["notebookPath"],
                    "errorType": "Exception",
                    "statusCode": 500,
                    "message": str(e),
                }
            )

    def on_close(self):
        print("WebSocket closed")


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    ws_scan_route_pattern = url_path_join(base_url, "nbdefense-jupyter", "scan")
    handlers = [
        (ws_scan_route_pattern, NBDefenseWSRouteHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
