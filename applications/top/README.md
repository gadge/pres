# @pres/top

![screen record](https://raw.githubusercontent.com/aksakalli/@pres/top/master/img/demo.gif)

System monitoring dashboard for terminal.

  [![NPM Version](https://img.shields.io/npm/v/@pres/top.svg)](https://npmjs.org/package/@pres/top)
  [![NPM Downloads](https://img.shields.io/npm/dm/@pres/top.svg)](https://npmjs.org/package/@pres/top)
  [![Snap Status](https://build.snapcraft.io/badge/aksakalli/@pres/top.svg)](https://build.snapcraft.io/user/aksakalli/@pres/top)
  [![Docker Pulls](https://img.shields.io/docker/pulls/aksakalli/@pres/top)](https://hub.docker.com/r/aksakalli/@pres/top)
  [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/aksakalli/@pres/top)](https://hub.docker.com/r/aksakalli/@pres/top/builds)

### Requirements

* Linux / OSX / Windows (partial support)
* Node.js >= v8

### Installation

```sh
$ npm install @pres/top -g
```

#### Docker

You need to assign host `net` and `pid` to access the metrics in the host machine.

```sh
$ docker run --rm -it \
    --name @pres/top \
    --net="host" \
    --pid="host" \
    aksakalli/@pres/top
```

-OR-

Run @pres/top in your terminal using the `@pres/top` command, but in a docker container by running the following lines.
```sh
$ sh -c "$(curl -fSsL https://raw.githubusercontent.com/aksakalli/@pres/top/master/@pres/top-docker.sh)"

$ @pres/top		# Run @pres/top from your terminal whenever you want to open @pres/top.
```

### Usage

Start @pres/top with the `@pres/top` command

```sh
$ @pres/top
```

To stop @pres/top use `q`, or `ctrl+c` in most shell environments.

You can sort the process table by pressing

* `p`: Process Id
* `c`: CPU usage
* `m`: Memory usage

### Troubleshooting

If you see question marks or other different characters, try to run it with these environment variables:

```sh
$ LANG=en_US.utf8 TERM=xterm-256color @pres/top
```

## License

Released under [the MIT license](LICENSE).
