from flask import Flask, render_template, request, jsonify
app=Flask(__name__)
@app.route("/")
def on():
    return render_template("index.html")
@app.route("/PAG1")
def pop():
    return render_template("inicio.html")
@app.route("/Pag2")
def one():
    return render_template("limork.html")
@app.route("/chat")
def chat():
    return render_template("chat.html")
@app.route("/mensaje",
methods = ["POST"])
def mensaje():
    datos_recibidos = request.json
    texto = datos_recibidos["mensaje"]
    mensaje_respuesta = f"Hola, escribiste {texto}, te doy la bienvenida"
    return  jsonify({"respuesta: ", mensaje_respuesta})
    
if __name__=="__main__":
    app.run(debug=True)
