| OSC | Description                  | Status                  | Format                                   |
| --- | ---------------------------- | ----------------------- | ---------------------------------------- |
| 0   | Set window title             | Only window title       | ESC ] 0 ; [title] \a                     |
| 2   | Set window title             | Converted to 0          |                                          |
| 4   | Set/read color palette       | Supported               | ESC ] 4 ; index1;rgb1;...;indexN;rgbN \a |
| 9   | iTerm2 Growl notifications   | Supported               | ESC ] 9 ; [message] \a                   |
| 10  | Set foreground color         | Supported               | ESC ] 10 ; [X11 color spec] \a           |
| 11  | Set background color         | Supported               | ESC ] 11 ; [X11 color spec] \a           |
| 50  | Set the cursor shape         | Supported               | ESC ] 50 ; CursorShape=[0\|1\|2] \a      |
| 52  | Clipboard operations         | Only “c” supported      | ESC ] 52 ; c ; [base64 data] \a          |
| 777 | rxvt-unicode (urxvt) modules | Only “notify” supported | ESC ] 777 ; notify ; [title] ; [body] \a |
