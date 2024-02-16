import string
import random
from datetime import datetime
from flask import *
from functools import wraps
import sqlite3

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/watchparty.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

def new_user():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (name, password, api_key),
        one=True)
    return u

# TODO: If your app sends users to any other routes, include them here.
#       (This should not be necessary).
@app.route('/')
@app.route('/profile')
@app.route('/login')
@app.route('/room')
@app.route('/room/<chat_id>')
def index(chat_id=None):
    return app.send_static_file('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404



# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API

# -------------------------------- SIGN UP ----------------------------------
@app.route('/api/signup', methods = ['POST'])
def signup():
    user_info = new_user()
    print("11111")
    if user_info:
        print("Have user")
        user_json = {
            "user_name": user_info["name"],
            "user_id": user_info["id"],
            "password": user_info["password"],
            "api_key": user_info["api_key"]
        }
        print("password" + user_info["password"])
        return jsonify(user_json), 200
    return jsonify({"error": "Failed to create a new user"}), 500

# -------------------------------- Login ----------------------------------

@app.route('/api/login', methods = ['POST'])
def login():
    if not request.json:
        return jsonify({"error": "No contents"}), 400
    user_name = request.json.get('user_name')
    password = request.json.get('password')

    
    query = "select * from users where name = ? and password = ?"
    parameters = (user_name, password)
    user_info = query_db(query, parameters, one=True)
    
    if user_info:
        print("update user")
        user_json = {
            "login": True,
            "user_id": user_info["id"],
            "user_name": user_info["name"],
            "password": user_info["password"],
            "api_key": user_info["api_key"]
        }
        return jsonify(user_json), 200
    return jsonify({"login": False, "error": "Failed to login"}), 500

# -------------------------------- updateUserName ----------------------------------

@app.route('/api/updateUserName', methods = ['POST'])
def updateUserName():
    print("enter")
    # Check API Key
    key = request.headers.get('API-Key')
    print(key)
    apiQuery = 'select * from users where api_key = ?'
    res = query_db(apiQuery, (key,), one = True)
    if not key or not res:
        return jsonify({"message": "Not valid API key."}), 401    

    # Update
    if not request.json:
        return jsonify({"error": "No contents"}), 400
    newName = request.json.get('user_name')
    id = request.json.get('user_id')
    print(id)
    
    updateQuery = "update users set name = ? where id = ?"
    parameters = (newName, id)
    query_db(updateQuery, parameters, one=True)
    if res:
        print("Have user")
        user_json = {
            "update": True,
        }
        return jsonify(user_json), 200
    print("Something wrong")
    return jsonify({"update": False, "error": "Failed to update, please check the username and password"}), 500    

# -------------------------------- updatePassword ----------------------------------

@app.route('/api/updatePassword', methods = ['POST'])
def updatePassword():
    print("enter")
    # Check API Key
    key = request.headers.get('API-Key')
    print(key)
    apiQuery = 'select * from users where api_key = ?'
    res = query_db(apiQuery, (key,), one = True)
    if not key or not res:
        return jsonify({"message": "Not valid API key."}), 401    

    # Update
    if not request.json:
        return jsonify({"error": "No contents"}), 400
    newPassword = request.json.get('password')
    id = request.json.get('user_id')
    print(id)
    
    updateQuery = "update users set password = ? where id = ?"
    parameters = (newPassword, id)
    query_db(updateQuery, parameters, one=True)
    if res:
        print("Have user")
        user_json = {
            "update": True,
        }
        return jsonify(user_json), 200
    print("Something wrong")
    return jsonify({"update": False, "error": "Failed to update, please check the username and password"}), 500    

# -------------------------------- createRooms ----------------------------------

@app.route('/api/room/create', methods = ['POST'])
def createRoom():
    print("enter")
    # Check API Key
    key = request.headers.get('API-Key')
    print(key)
    apiQuery = 'select * from users where api_key = ?'
    res = query_db(apiQuery, (key,), one = True)
    if not key or not res:
        return jsonify({"message": "Not valid API key."}), 401    

    # Insert a new Room
    room = query_db('insert into rooms (name) values (?) returning id, name', ["room"], one=True)
    print(room["id"])
    query = "update rooms set name = ? where id = ?"
    roomName = "Room" + str(room["id"])
    parameters = (roomName, room["id"])
    query_db(query, parameters, one=True)
    if query:
        print("Have user")
        room_create = {
            "create": True,
        }
        return jsonify(room_create), 200
    print("Something wrong")
    return jsonify({"create": False, "error": "Failed to update, please check the username and password"}), 500    


@app.route('/api/room/showRoom', methods = ['GET'])
def showRoom():
    # GetRoomsList
    rooms = query_db(query = 'select * from rooms')
    if rooms:
        roomList = []
        for room in rooms:
            room_info = {"room_id": room["id"], "room_name": room["name"]}
            roomList.append(room_info)

        return jsonify(roomList), 200
    print("Something wrong")
    return jsonify({"error": "Failed to get rooms"}), 500    

# Show all messages in the room get
@app.route('/api/room/<int:room_id>/messages', methods = ['GET'])
def getMessages(room_id):
    messages = query_db('select users.name, messages.body, messages.id from messages join users on messages.user_id = users.id where messages.room_id  = ? order by messages.id asc', [room_id])
    message_in_room = []
    if not messages:
        return jsonify(message_in_room), 200
    for message in messages:
        m_info = {"m_id": message[2], "user_name": message[0], "m_body": message[1]}
        message_in_room.append(m_info)

    print(message_in_room[0]["user_name"])
    return jsonify(message_in_room), 200


# POST to post a new message to a room
@app.route('/api/room/<int:room_id>/messages', methods=['POST'])
def post_messages(room_id):
    if not request.json:
        return jsonify({"error": "No contents"}), 400
    content = request.json.get('m_body')
    user_id = request.json.get('user_id')

    query = "insert into messages (body, room_id, user_id) values (?, ?, ?)"
    parameters = (content, room_id, user_id)
    query_db(query, parameters)
    return jsonify({"message": "Message posted successfully"}), 201


# Enter room 
@app.route('/api/room/<int:room_id>', methods = ['GET'])
def emterRoom(room_id):
    # Get the room
    room = query_db('select * from rooms where id = ?', [room_id], one = True)
    if room:
        room_info = {"room_id": room["id"], "room_name": room["name"]}
        return jsonify(room_info), 200
    print("Something wrong")
    return jsonify({"error": "Failed to get rooms"}), 500    


# Change room name 

# POST to change the name of a room
@app.route('/api/room/<int:room_id>/changeRoomName', methods=['POST'])
def change_room_name(room_id):
    print("change name")
    if not request.json:
        return jsonify({"error": "No contents"}), 400
    
    newRoomName = request.json.get('name')
    query = 'UPDATE rooms SET name = ? where id = ?'
    parameters = (newRoomName, room_id)
    query_db(query, parameters)
    return jsonify({"message": "Room name changed successfully"}), 201