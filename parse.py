from sklearn import metrics
from sklearn.model_selection import train_test_split
from sklearn import datasets
from sklearn.naive_bayes import GaussianNB
from sklearn import preprocessing

wheather = ['Sunny', 'Sunny', 'Overcast', 'Rainy', 'Rainy', 'Rainy', 'Overcast', 'Sunny', 'Sunny',
            'Rainy', 'Sunny', 'Overcast', 'Overcast', 'Rainy']

temp = ['Hot', 'Hot', 'Hot', 'Mild', 'Cool', 'Cool', 'Cool',
        'Mild', 'Cool', 'Mild', 'Mild', 'Mild', 'Hot', 'Mild']

play = ['No', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes',
        'No', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'No']


def wheather_encoder(param):

    # Assigning features and label variables
    # Create a Gaussian Classifier
    model = GaussianNB()

    # Predict Output
    predicted = model.predict([[0, 2]])  # 0:Overcast, 2:Mild
    # Import LabelEncoder

    # creating labelEncoder
    le = preprocessing.LabelEncoder()

    # Converting string labels into numbers.
    wheather_encoded = le.fit_transform(wheather)
    temp_encoded = le.fit_transform(temp)
    label = le.fit_transform(play)
    features = zip(wheather_encoded, temp_encoded)
    # Train the model using the training sets
    model.fit(features, label)

    if(param == 'weather'):
        print(wheather_encoded)

    if(param == 'temp'):
        print("Temp:", temp_encoded)
        print("Play:", label)

    if(param == 'weather__temp'):
        print(features)

    if(param == 'model'):
        print("Predicted Value:", predicted)

    return features


def print_datasets(_type):
        # Create a Gaussian Classifier
    model = GaussianNB()

    # Train the model using the training sets
    model.fit(features, label)

    # Predict Output
    predicted = model.predict([[0, 2]])  # 0:Overcast, 2:Mild
    print("Predicted Value:", predicted)
 # Import scikit-learn dataset library
    # Load dataset
    wine = datasets.load_wine()

    if(_type == 'feature'):
        # print the names of the 13 features
        print("Features: ", wine.feature_names)

        # print the label type of wine(class_0, class_1, class_2)
        print("Labels: ", wine.target_names)

    if(_type == 'shape'):
        wine.data.shape
        print(wine.data[0:5])
    if(_type == 'shape'):
        print(wine.target)


wheather_encoder('weather__temp')
