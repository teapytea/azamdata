# Program menggunakan Python (Flask) untuk backend dan HTML/CSS untuk frontend

# app.py
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://user:password@localhost/pos_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'operator'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Client(db.Model):
    __tablename__ = 'Clients'
    client_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(15))
    email = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Service(db.Model):
    __tablename__ = 'Services'
    service_id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Schedule(db.Model):
    __tablename__ = 'Schedules'
    schedule_id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('Clients.client_id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('Services.service_id'), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('pending', 'completed', 'cancelled'), default='pending')

class Invoice(db.Model):
    __tablename__ = 'Invoices'
    invoice_id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('Schedules.schedule_id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('unpaid', 'paid'), default='unpaid')
    issued_date = db.Column(db.DateTime, default=db.func.current_timestamp())

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/clients', methods=['GET', 'POST'])
def manage_clients():
    if request.method == 'POST':
        data = request.json
        new_client = Client(
            name=data['name'],
            address=data.get('address', ''),
            phone=data.get('phone', ''),
            email=data.get('email', '')
        )
        db.session.add(new_client)
        db.session.commit()
        return jsonify({'message': 'Client added successfully'})
    clients = Client.query.all()
    return jsonify([{
        'client_id': client.client_id,
        'name': client.name,
        'address': client.address,
        'phone': client.phone,
        'email': client.email
    } for client in clients])

@app.route('/services', methods=['GET', 'POST'])
def manage_services():
    if request.method == 'POST':
        data = request.json
        new_service = Service(
            service_name=data['service_name'],
            description=data.get('description', ''),
            price=data['price']
        )
        db.session.add(new_service)
        db.session.commit()
        return jsonify({'message': 'Service added successfully'})
    services = Service.query.all()
    return jsonify([{
        'service_id': service.service_id,
        'service_name': service.service_name,
        'description': service.description,
        'price': float(service.price)
    } for service in services])

@app.route('/schedules', methods=['GET', 'POST'])
def manage_schedules():
    if request.method == 'POST':
        data = request.json
        new_schedule = Schedule(
            client_id=data['client_id'],
            service_id=data['service_id'],
            scheduled_date=data['scheduled_date'],
            status=data.get('status', 'pending')
        )
        db.session.add(new_schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule added successfully'})
    schedules = Schedule.query.all()
    return jsonify([{
        'schedule_id': schedule.schedule_id,
        'client_id': schedule.client_id,
        'service_id': schedule.service_id,
        'scheduled_date': schedule.scheduled_date.strftime('%Y-%m-%d %H:%M:%S'),
        'status': schedule.status
    } for schedule in schedules])

@app.route('/invoices', methods=['GET', 'POST'])
def manage_invoices():
    if request.method == 'POST':
        data = request.json
        new_invoice = Invoice(
            schedule_id=data['schedule_id'],
            amount=data['amount'],
            status=data.get('status', 'unpaid')
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice added successfully'})
    invoices = Invoice.query.all()
    return jsonify([{
        'invoice_id': invoice.invoice_id,
        'schedule_id': invoice.schedule_id,
        'amount': float(invoice.amount),
        'status': invoice.status,
        'issued_date': invoice.issued_date.strftime('%Y-%m-%d %H:%M:%S')
    } for invoice in invoices])

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
