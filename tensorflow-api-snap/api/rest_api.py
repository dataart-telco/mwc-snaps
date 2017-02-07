#!/usr/bin/python

from functools import wraps
from tensorflow.models.image.imagenet import classify_image
from flask import Flask, request, abort, jsonify
from werkzeug.utils import secure_filename
import json
import os
import numpy
import sys, getopt

# The actual decorator function
def require_appkey(view_function):
    @wraps(view_function)
    # the new, post-decoration function. Note *args and **kwargs here.
    def decorated_function(*args, **kwargs):
        if request.headers.get('api-key') == __API_KEY__:
            return view_function(*args, **kwargs)
        else:
            abort(401)
    return decorated_function

def dump(obj):
    print json.dumps(obj, 
        default=lambda o: o.__dict__, 
        sort_keys=True, indent=4)

class ClassifyFlags:
    def __init__ (self):
        self.model_dir = '/tmp/imagenet'
        self.image_file = ''
        self.num_top_predictions = 3

class Prediction:
    def __init__ (self, name, score):
        self.name = name
        self.score = float(score)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Prediction):
            return { 'name': obj.name, 'score': obj.score }
        return super(CustomJSONEncoder, self).default(obj)

classify_image.FLAGS = ClassifyFlags()

dump(classify_image.FLAGS)

classify_image.maybe_download_and_extract()
classify_image.create_graph()

UPLOAD_FOLDER = '/tmp'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.json_encoder = CustomJSONEncoder


def recognize_image(image):
    if not classify_image.tf.gfile.Exists(image):
        classify_image.tf.logging.fatal('File does not exist %s', image)
    image_data = classify_image.tf.gfile.FastGFile(image, 'rb').read()
    with classify_image.tf.Session() as sess:
        # Some useful tensors:
        # 'softmax:0': A tensor containing the normalized prediction across
        #   1000 labels.
        # 'pool_3:0': A tensor containing the next-to-last layer containing 2048
        #   float description of the image.
        # 'DecodeJpeg/contents:0': A tensor containing a string providing JPEG
        #   encoding of the image.
        # Runs the softmax tensor by feeding the image_data as input to the graph.
        softmax_tensor = sess.graph.get_tensor_by_name('softmax:0')
        predictions = sess.run(softmax_tensor, {'DecodeJpeg/contents:0': image_data})
        predictions = classify_image.np.squeeze(predictions)
        # Creates node ID --> English string lookup.
        node_lookup = classify_image.NodeLookup()

        top_k = predictions.argsort()[-classify_image.FLAGS.num_top_predictions:][::-1]
        result = []
        for node_id in top_k:
            human_string = node_lookup.id_to_string(node_id)
            score = predictions[node_id]
            result.append(Prediction(human_string, score))
            print('%s (score = %.5f)' % (human_string, score))

        return result


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route("/visual-recognition/classify", methods=['POST'])
@require_appkey
def api():
    if 'file' not in request.files:
        print 'No file part'
        return abort(400)
    file = request.files['file']
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        print 'No selected file'
        return abort(400)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filePath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filePath)
        predictions = recognize_image(filePath)
        return jsonify(predictions)
    print 'file is None or not allowed file name'
    return abort(500)

def print_help():
    print ('rest_api.py --api-key <api_key>')

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "h",["api-key="])
    except getopt.GetoptError:
        print_help()
        sys.exit(2)

    apiKey = None
    for opt, arg in opts:
        if opt == '-h':
            print_help()
            sys.exit()
        elif opt in ("--api-key"):
            apiKey = arg

    if not apiKey:
        print_help()
        sys.exit(2)

    global __API_KEY__
    __API_KEY__ = apiKey
    app.run(host='0.0.0.0')

if __name__ == "__main__":
   main(sys.argv[1:])
