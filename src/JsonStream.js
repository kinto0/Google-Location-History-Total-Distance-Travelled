// const log = require('debug-level').log('JsonStream');
const Debug = require('debug-level');
const debug = new Debug('JsonStream');

const fileReaderStream = require('filereader-stream');
const drop = require('drag-and-drop-files');

const { Writable, Transform, Readable } = require('readable-stream');

const clarinetstream = require("clarinet").createStream();

class JsonStream {
    static createReadStream(file, cutoff) {
        class ReadStream extends Readable {
            constructor(options) {
                super(options);

                let arrayDepth = 0;
                let objectDepth = 0;

                let arraystack = [];
                let objectstack = [];

                let currentKey;

                clarinetstream.on('openarray', () => {
                    arrayDepth++;

                    if (arrayDepth + objectDepth > cutoff) {
                        const newArray = [];
                        arraystack.push(newArray);

                        // Array is value of a object key
                        if (currentKey) {
                            objectstack[objectstack.length - 1][currentKey] = newArray;
                            currentKey = null;
                        }
                    }
                });

                clarinetstream.on('openobject', function(firstKey) {
                    objectDepth++;

                    if (arrayDepth + objectDepth > cutoff) {
                        const newObject = {};

                        // Object is the value of an object key
                        if (currentKey) {
                            objectstack[objectstack.length - 1][currentKey] = newObject;
                        }

                        // Are we inside an open array currently?
                        if (arraystack.length > 0) {
                            arraystack[arraystack.length - 1].push(newObject);
                        }

                        objectstack.push(newObject);

                        currentKey = firstKey;
                    }
                });

                clarinetstream.on('closearray', () => {
                    arrayDepth--;

                    const closedArray = arraystack.pop();

                    // Are we at the new root?
                    if (arrayDepth + objectDepth === cutoff) {
                        this.push(closedArray)
                    }
                });

                clarinetstream.on('closeobject', () => {
                    objectDepth--;

                    const closedObject = objectstack.pop()

                    // Are we at the new root?
                    if (objectDepth + arrayDepth === cutoff) {
                        this.push(closedObject);
                    }
                });

                clarinetstream.on('value', (value) => {
                    if (arrayDepth + objectDepth > cutoff) {

                        if (!currentKey)
                            throw Error(`No currentKey ${currentKey}`);

                        objectstack[objectstack.length - 1][currentKey] = value;
                        currentKey = null;
                    }
                });

                clarinetstream.on('key', (key) => {
                    if (arrayDepth + objectDepth > cutoff) {

                        currentKey = key;
                    }
                });

                clarinetstream.on('end', () => {
                    this.push(null);
                });

                fileReaderStream(file, { chunkSize: 1024 * 1024 * 5 })
                .pipe(transform)
                .pipe(clarinetstream)
            }
            _read(size) {

            }
        }

        return new ReadStream({ objectMode: true });
    }
}

let chunkNumber = 0;
const transform = new Transform({
    transform(data, encoding, cb) {
        chunkNumber++

        console.log('Processing chunk, no, MB:', chunkNumber, chunkNumber * 5, 'MB');

        // data = data.toString();
        // console.log('data transform2', typeof data);
        cb(null, data);
    }
});

const writeable = new Writable({
  write(chunk, encoding, callback) {
    console.log('typeof chunk', typeof chunk);
    // console.log('encoding, chunk', encoding, chunk);
    console.log('chunk', chunk);
    callback();
  },
  writev(chunks, callback) {
    // ...
    console.log('writeev', chunk);
    },
    destory(err, cb) {
        console.log('destory, err:', err);
        cb();
    },
    final(cb) {
        console.log('closing stream');
        cb();
    }
});


module.exports = JsonStream;
