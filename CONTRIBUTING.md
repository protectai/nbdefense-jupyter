# 👩‍💻 CONTRIBUTING

Welcome! We're glad to have you. If you would like to report a bug, request a new feature or enhancement, follow [this link](https://nbdefense.ai/faq) for more help.

If you're looking for documentation on how to use the NB Defense Jupyter Lab Extension, you can find that [here](https://nbdefense.ai).

## ❗️ Requirements

- JupyterLab >= 3.0
- NodeJS

## 💪 Developing with the NB Defense Jupyter Lab Extension

Note: The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

1. Clone the repository:

   ```bash
   git clone git@github.com:protectai/nbdefense-jupyter.git
   ```

1. To install the extension for development execute the following command:

   ```bash
   make install-dev
   ```

1. Start Jupyter Lab:

   ```bash
   jupyter lab
   ```

1. To auto rebuild the client while developing run:

   ```bash
   jlpm watch
   ```

   You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

## 📚 Troubleshooting

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```
