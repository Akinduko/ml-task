import zerorpc
import gevent, signal
import os
import json
import sys
import argparse
import textwrap
import logging
from utils.train_model import train
from utils.train_model import train_model
from utils.predict_model import predictor
from utils.model import model_delete
from utils.model import import_model
from utils.model import all_models
from utils.model import generate_name
from utils.constants import default_model
from utils.constants import model_dir
from utils.constants import model_extension
from utils.constants import image_extensions
from utils.constants import truth_values
from utils.make_train_test import make_train_test

port = 1234
addr = 'tcp://127.0.0.1:' + str(port)


class _main(object):
    print('Server running at:', addr)

    def echo(self, message):
        print('Server running at:', message)
        return ('Server running at:', message)

    def train(self, req):

        groupA = req['groupa']
        groupB = req['groupb']

        #Any arg supplied to this will be seen as True, no arg means False
        generate_model_name = req['model']

        # If the action is train, the model is the name of the new model
        # that is going to be trained; if it's predict, the model is the
        # name of the model to use for prediction
        model = req['model']
        #Means user fulfilled the requirement. we can proceed now
        process_folders = make_train_test(groupA, groupB)
        train_folder_path = process_folders.get("training_set")
        test_folder_path = process_folders.get("test_set")
        new_model = model
        if not new_model:
            if generate_model_name in truth_values:
                #The user want us to generate model name for them
                #trp and tep args are required args implicitly for users from app
                if groupA and groupB:

                    #generate name
                    new_model = generate_name(train_folder_path)
                    train_model(new_model, train_folder_path, test_folder_path)
                    return
                #Here, the user might have supplied one folder argument or None at all
                print(
                    "\n Both training folder and test folder arguments are required"
                )
                sys.stdout.flush()
                return
            #The user did not supply model name and did not ask us to generate one. So definitely,
            # we are the one running this from console app
            #We don't want to retrain our default model. Better to delete. So we have to check if we
            #have trained our default model before. If default model exist, return
            if default_model in all_models():
                print(
                    "Retraining the default model is forbidden. Supply model name or Delete the default model manually and proceed"
                )
                sys.stdout.flush()
                return

            #Training our default model now
            new_model = default_model
            print("Training the default model now...")
            #We use train function directly here for obvious reasons
            sys.stdout.flush()
            return train(new_model)

        #Model name supplied
        new_model = model + model_extension
        if new_model in all_models():
            print(
                "There's already a model with that name. Please choose another name"
                " or find a model with name {}. Delete it and try again".
                format(new_model))
            sys.stdout.flush()
            return
        #From here on, we expect user to supply training dataset and test dataset.
        #trp and tep args are required args implicitly for users from app
        if train_folder_path and test_folder_path:
            #Means user fulfilled the requirement. we can proceed now
            return train_model(new_model, train_folder_path, test_folder_path)
        #Here, the user might have supplied one folder argument or None at all
        print("\n Both training folder and test folder arguments are required")
        sys.stdout.flush()
        return

    def predict(self, req):
        print('Server running at:', message['folder'])
        return ('Server running at:', message['folder'])


s = zerorpc.Server(_main())
s.bind(addr)
gevent.signal(signal.SIGTERM, s.stop)
gevent.signal(signal.SIGINT, s.stop)  # ^C
s.run()
