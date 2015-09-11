# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

course1 = Course.create

student1 = User.new
student2 = User.new
student3 = User.new
student4 = User.new
student5 = User.new
student6 = User.new
student7 = User.new
student8 = User.new
student9 = User.new

course1.participants << student1
course1.participants << student2
course1.participants << student3
course1.participants << student4
course1.participants << student5
course1.participants << student6
course1.participants << student7
course1.participants << student8
course1.participants << student9

assignment1 = Assignment.new
assignment2 = Assignment.new
assignment3 = Assignment.new
assignment4 = Assignment.new
assignment5 = Assignment.new
assignment6 = Assignment.new
assignment7 = Assignment.new
assignment8 = Assignment.new
assignment9 = Assignment.new


course1.assignments << assignment1
course1.assignments << assignment2
course1.assignments << assignment3
course1.assignments << assignment4
course1.assignments << assignment5
course1.assignments << assignment6
course1.assignments << assignment7
course1.assignments << assignment8
course1.assignments << assignment9

assignment1.location = Location.create x: 100, y: 250
assignment2.location = Location.create x: 330, y: 180
assignment3.location = Location.create x: 500, y: 130
assignment4.location = Location.create x: 550, y: 310
assignment5.location = Location.create x: 420, y: 460
assignment6.location = Location.create x: 380, y: 550
assignment7.location = Location.create x: 240, y: 390
assignment8.location = Location.create x: 80,  y: 600
assignment9.location = Location.create x: 140, y: 800

student2.assignments << assignment1
student2.assignments << assignment2
student2.assignments << assignment3

student3.assignments << assignment2
student3.assignments << assignment6

student4.assignments << assignment1
student4.assignments << assignment2
student4.assignments << assignment4
student4.assignments << assignment5
student4.assignments << assignment7

student5.assignments << assignment3
student5.assignments << assignment6
student5.assignments << assignment7
student5.assignments << assignment8

student6.assignments << assignment9

student7.assignments << assignment6
student7.assignments << assignment3

student8.assignments << assignment8
student8.assignments << assignment4

student9.assignments << assignment5
student9.assignments << assignment1
