This is a demo app for using POS peripherals from the browser with QZTray + React.

# Instructions

- `npm install`
- `npm start`
- Go to `localhost:3000` in your browser.

For printing:
- Install the drivers for the receipt printer provided by the manufacterer. Most seem to only support windows.
- Download and install QZ Tray. https://qz.io/download/ It'll run in the background and process print jobs sent to it from the browser.
- You'll need to put the digital certifical and private key in the asset folder to enable silent printing.  Ask Graham he has them on his laptop.
- The first time you use the app it will give you a security prompt.  If you have the certificate and key in the right spot
  you can select to remember your descision.
- Select the printer from the dropdown menu.
- Hit print.