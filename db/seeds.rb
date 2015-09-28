# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

course1 = Course.create name: "Ohtuprojekti"

student1 = User.create firstName: "Heimo", lastName: "Vesa"
student2 = User.create firstName: "Allan", lastName: "Kurma"
student3 = User.create firstName: "Irma", lastName: "Kääriäinen"
student4 = User.create firstName: "Aulis", lastName: "Homelius"
student5 = User.create firstName: "Asko", lastName: "Vilenius"
student6 = User.create firstName: "Sam", lastName: "Makkonen"
student7 = User.create firstName: "Rivo", lastName: "Riitta"
student8 = User.create firstName: "Inkeri", lastName: "Kääriäinen"
student9 = User.create firstName: "Gootti", lastName: "Kusta"

course1.participants << student1
course1.participants << student2
course1.participants << student3
course1.participants << student4
course1.participants << student5
course1.participants << student6
course1.participants << student7
course1.participants << student8
course1.participants << student9

assignment1 = Assignment.new number: 1
assignment2 = Assignment.new number: 2
assignment3 = Assignment.new number: 3
assignment4 = Assignment.new number: 4
assignment5 = Assignment.new number: 5
assignment6 = Assignment.new number: 6
assignment7 = Assignment.new number: 7
assignment8 = Assignment.new number: 8
assignment9 = Assignment.new number: 9


course1.assignments << assignment1
course1.assignments << assignment2
course1.assignments << assignment3
course1.assignments << assignment4
course1.assignments << assignment5
course1.assignments << assignment6
course1.assignments << assignment7
course1.assignments << assignment8
course1.assignments << assignment9

assignment1.location = Location.create x: 75, y: 850
assignment2.location = Location.create x: 310, y: 795
assignment3.location = Location.create x: 540, y: 865
assignment4.location = Location.create x: 625, y: 685
assignment5.location = Location.create x: 405, y: 605
assignment6.location = Location.create x: 245, y: 735
assignment7.location = Location.create x: 150, y: 520
assignment8.location = Location.create x: 275, y: 405
assignment9.location = Location.create x: 525, y: 440

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


assignment2.dependencies << assignment1

assignment6.dependencies << assignment1
assignment6.dependencies << assignment4

assignment8.dependencies << assignment5
assignment8.dependencies << assignment4

assignment9.dependencies << assignment3
assignment9.dependencies << assignment7
assignment9.dependencies << assignment8