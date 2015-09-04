# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

course1 = Course.create

student1 = User.create
student2 = User.create
student3 = User.create
student4 = User.create
student5 = User.create
student6 = User.create
student7 = User.create

assignment1 = Assignment.new
assignment2 = Assignment.new
assignment3 = Assignment.new
assignment4 = Assignment.new
assignment5 = Assignment.new
assignment6 = Assignment.new
assignment7 = Assignment.new
assignment8 = Assignment.new
assignment9 = Assignment.new

course1.participants << student1
course1.participants << student2
course1.participants << student3
course1.participants << student4
course1.participants << student5
course1.participants << student6
course1.participants << student7
course1.participants << student8
course1.participants << student9

course1.assignments << assignment1
course1.assignments << assignment2
course1.assignments << assignment3
course1.assignments << assignment4
course1.assignments << assignment5
course1.assignments << assignment6
course1.assignments << assignment7
course1.assignments << assignment8
course1.assignments << assignment9

assignment1.location = Location.new x: 10, y: 25
assignment2.location = Location.new x: 33, y: 18
assignment3.location = Location.new x: 50, y: 13
assignment4.location = Location.new x: 55, y: 31
assignment5.location = Location.new x: 42, y: 46
assignment6.location = Location.new x: 38, y: 55
assignment7.location = Location.new x: 24, y: 39
assignment8.location = Location.new x: 8,  y: 60
assignment9.location = Location.new x: 14, y: 80

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