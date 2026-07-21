# Scripts Folder

This folder contains start and stop scripts for local Docker-based development across OS targets.

Current scripts:

- `start-mac.sh`: Build image and start container on macOS.
- `stop-mac.sh`: Stop and remove the container on macOS.
- `start-linux.sh`: Build image and start container on Linux.
- `stop-linux.sh`: Stop and remove the container on Linux.
- `start-windows.ps1`: Build image and start container on Windows PowerShell.
- `stop-windows.ps1`: Stop and remove the container on Windows PowerShell.

Default runtime names:

- Image: `pm-mvp`
- Container: `pm-mvp-app`