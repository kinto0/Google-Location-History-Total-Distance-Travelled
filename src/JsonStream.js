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
                console.log('constructor')

                let arrayStartDepth;
                let arrayEndDepth;

                let arrayDepth = 0;
                let objectDepth = 0;

                let arraystack = [];
                let objectstack = [];

                let currentKey;
                //
                clarinetstream.on('openarray', () => {
                    arrayDepth++;
                    // console.log('openarray, depth', arrayDepth);

                    if (arrayDepth + objectDepth > cutoff) {
                        // console.log('pushing new array');
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
                    // console.log('openobject, depth', objectDepth);

                    if (arrayDepth + objectDepth > cutoff) {
                        // console.log('pushing new object');
                        const newObject = {};

                        // Object is value of an object key
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

                    // Are we at the root - cutoff?
                    if (arrayDepth + objectDepth === cutoff) {

                        // if ((arraystack.length + objectstack.length) === minDepth) {
                            console.log('emitting array', closedArray);
                            this.push(closedArray)
                        // }
                    }

                    // console.log('closearray, arrayDepth', arrayDepth);
                });

                clarinetstream.on('closeobject', () => {
                    objectDepth--;
                    // console.log('closedobject, depth:, cutoff', objectDepth, cutoff);

                    const closedObject = objectstack.pop()

                    // Are we at the root - cutoff
                    if (objectDepth + arrayDepth === cutoff) {
                    // if (((arraystack.length + objectstack.length) - minDepth) === minDepth) {
                        // if ((arraystack.length + objectstack.length) === minDepth) {
                            // console.log('emitting object', closedObject);
                            this.push(closedObject);
                        // }
                    }
                });

                clarinetstream.on('value', (value) => {
                    if (arrayDepth + objectDepth > cutoff) {

                        if (!currentKey)
                        throw Error(`No currentKey ${currentKey}`);

                        objectstack[objectstack.length - 1][currentKey] = value;
                        currentKey = null;
                    }
                    // console.log("Value: " + value);
                });

                clarinetstream.on('key', (key) => {
                    if (arrayDepth + objectDepth > cutoff) {

                        currentKey = key;
                    }
                    // console.log("Key: " + key);
                });

                clarinetstream.on('end', () => {
                    this.push(null);
                });

                // console.log('pipe', file);

                fileReaderStream(file, { chunkSize: 1024 * 1024 * 5 })
                .pipe(transform)
                .pipe(clarinetstream)
                // .pipe(writeable);
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
