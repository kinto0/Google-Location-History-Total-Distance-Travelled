const Debug = require('debug-level');
const debug = new Debug('JsonStream');

const fileReaderStream = require('filereader-stream');

const { Transform, Readable } = require('readable-stream');

const jsonParser = require('clarinet').createStream();

let filesize = 0;
let chunkNumber = 0;

class JsonStream {
    static createReadStream(file, cutoff, { chunkSize = 2 * 1024 * 1024 } = {}) {
        class JsonReadStream extends Readable {
            constructor(options) {
                super(options);

                let arrayDepth = 0;
                let objectDepth = 0;

                let arraystack = [];
                let objectstack = [];

                let currentKey;

                jsonParser.on('openarray', () => {
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

                jsonParser.on('openobject', function(firstKey) {
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

                jsonParser.on('closearray', () => {
                    arrayDepth--;

                    const closedArray = arraystack.pop();

                    // Are we at the root set by the cutoff?
                    if (arrayDepth + objectDepth === cutoff) {
                        this.push(closedArray)
                    }
                });

                jsonParser.on('closeobject', () => {
                    objectDepth--;

                    const closedObject = objectstack.pop()

                    // Are we at the root set by the cutoff?
                    if (objectDepth + arrayDepth === cutoff) {
                        this.push(closedObject);
                    }
                });

                jsonParser.on('value', (value) => {
                    if (arrayDepth + objectDepth > cutoff) {

                        if (!currentKey)
                            throw Error(`No currentKey ${currentKey}`);

                        objectstack[objectstack.length - 1][currentKey] = value;
                        currentKey = null;
                    }
                });

                jsonParser.on('key', (key) => {
                    if (arrayDepth + objectDepth > cutoff) {
                        currentKey = key;
                    }
                });

                jsonParser.on('end', () => {
                    this.push(null);
                });

                // Pass on progress information events
                progressCounter.on('progress', progress => {
                    this.emit('progress', progress);
                });

                filesize = file.size;

                fileReaderStream(file, { chunkSize })
                    .pipe(progressCounter)
                    .pipe(jsonParser)
            }
            _read(size) {
            }
        }

        const progressCounter = new Transform({
            transform(data, encoding, cb) {
                chunkNumber++;
                const percentage = Math.round((chunkNumber * chunkSize / filesize * 100) * 100) / 100;

                this.emit('progress', { percentage });

                cb(null, data);
            }
        });

        return new JsonReadStream({ objectMode: true });
    }
}

module.exports = JsonStream;
