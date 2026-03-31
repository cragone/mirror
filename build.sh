#!/bin/bash


echo "deploying mirror"

echo "setting py server"

cd server
python3 -m venv venv
source venv/bin/activate
pip freeze > requirements.txt
pip install -r requirements.txt
python main.py
