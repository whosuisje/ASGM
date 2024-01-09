from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import pandas as pd
import json
import tensorflow as tf
from tensorflow import keras
import numpy as np
from tensorflow.keras.preprocessing import text
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras import layers
import openai

app = Flask(__name__)

# Define the TransformerBlock class
@keras.utils.register_keras_serializable()
class TransformerBlock(layers.Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super().__init__()
        self.att = layers.MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim)
        self.ffn = keras.Sequential([
            layers.Dense(ff_dim, activation="relu"),
            layers.Dense(embed_dim),
        ])
        self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
        self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(rate)
        self.dropout2 = layers.Dropout(rate)

    def call(self, inputs, training):
        attn_output = self.att(inputs, inputs)
        attn_output = self.dropout1(attn_output, training=training)
        out1 = self.layernorm1(inputs + attn_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output, training=training)
        return self.layernorm2(out1 + ffn_output)

# Define the TokenAndPositionEmbedding class
@keras.saving.register_keras_serializable()
class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self, maxlen, vocab_size, embed_dim):
        super().__init__()
        self.token_emb = layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)
        self.pos_emb = layers.Embedding(input_dim=maxlen, output_dim=embed_dim)

    def call(self, x):
        maxlen = tf.shape(x)[-1]
        positions = tf.range(start=0, limit=maxlen, delta=1)
        positions = self.pos_emb(positions)
        x = self.token_emb(x)
        return x + positions

# Load tokenizer and model
with open('tokenizer.json') as f:
    data = json.load(f)
    tokenizer = tokenizer_from_json(data)

model = load_model('my_model.keras')
maxlen = 49
# Load the model
model_path = 'my_model.keras'
model = load_model(model_path)
# Endpoint to receive the student's answer from the Angular app
@app.route('/predict_grade', methods=['GET'])
def predict_grade():
    data = request.get_json()
    input_text = data.get('answer')
    print(data,"haha")

    if input_text is None:
        return jsonify({'error': 'Answer field is missing'}), 400

    # Tokenize the input answer
    input_sequence = tokenizer.texts_to_sequences([input_text])
    padded_input_sequence = tf.keras.preprocessing.sequence.pad_sequences(input_sequence, maxlen=maxlen, padding='post')

    # Make the prediction
    prediction = model.predict(padded_input_sequence)

    # Get the predicted class
    predicted_class = int(np.argmax(prediction))

    # Return the predicted class to the Angular app
    return jsonify({'predicted_class': predicted_class})



# Function to guide the student in generating the correct answer
def guide_student(question, student_answer):
    prompt = f"The student asked: {question}\n" \
             f"The student's answer: {student_answer}\n" \
             f"Guide the student to the correct answer:"

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        temperature=0.5,
        max_tokens=150
    )

    return jsonify( response.choices[0].text.strip())

# Endpoint to grade short answers

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')

    if prompt is None:
        return jsonify({'error': 'Prompt field is missing'}), 400

    generated_text = guide_student(prompt)
    return generated_text

if __name__ == '__main__':
    app.run(debug=True)
