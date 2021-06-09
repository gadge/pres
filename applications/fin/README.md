# @pres/fin

![screen record](https://raw.githubusercontent.com/aksakalli/@pres/fin/master/img/demo.gif)

System monitoring dashboard for terminal.

  [![NPM Version](https://img.shields.io/npm/v/@pres/fin.svg)](https://npmjs.org/package/@pres/fin)
  [![NPM Downloads](https://img.shields.io/npm/dm/@pres/fin.svg)](https://npmjs.org/package/@pres/fin)
  [![Snap Status](https://build.snapcraft.io/badge/aksakalli/@pres/fin.svg)](https://build.snapcraft.io/user/aksakalli/@pres/fin)
  [![Docker Pulls](https://img.shields.io/docker/pulls/aksakalli/@pres/fin)](https://hub.docker.com/r/aksakalli/@pres/fin)
  [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/aksakalli/@pres/fin)](https://hub.docker.com/r/aksakalli/@pres/fin/builds)

### Requirements

* Linux / OSX / Windows (partial support)
* Node.js >= v8

### Installation

```sh
$ npm install @pres/fin -g
```

#### Docker

You need to assign host `net` and `pid` to access the metrics in the host machine.

```sh
$ docker run --rm -it \
    --name @pres/fin \
    --net="host" \
    --pid="host" \
    aksakalli/@pres/fin
```

-OR-

Run @pres/fin in your terminal using the `@pres/fin` command, but in a docker container by running the following lines.
```sh
$ sh -c "$(curl -fSsL https://raw.githubusercontent.com/aksakalli/@pres/fin/master/@pres/fin-docker.sh)"

$ @pres/fin		# Run @pres/fin from your terminal whenever you want to open @pres/fin.
```

### Usage

Start @pres/fin with the `@pres/fin` command

```sh
$ @pres/fin
```

To stop @pres/fin use `q`, or `ctrl+c` in most shell environments.

You can sort the process table by pressing

* `p`: Process Id
* `c`: CPU usage
* `m`: Memory usage

### Troubleshooting

If you see question marks or other different characters, try to run it with these environment variables:

```sh
$ LANG=en_US.utf8 TERM=xterm-256color @pres/fin
```

## License

Released under [the MIT license](LICENSE).
