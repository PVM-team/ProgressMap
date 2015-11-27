# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
teacher1 = Teacher.create email: "ijasteemu@gmail.com", name: "testiope1"
teacher2  = Teacher.create email: "s4knet@gmail.com", name: "testiope2"

course1 = Course.create name: "Ohtuprojekti"

teacher1.courses << course1

student1 = Student.create firstName: "Heimo", lastName: "Vesa", email: "s4knet@gmail.com"
student2 = Student.create firstName: "Allan", lastName: "Kurma", email: "mikhuttu@cs.helsinki.fi"
student3 = Student.create firstName: "Irma", lastName: "Kääriäinen", email: "ohtupvmteam1@gmail.com"
student4 = Student.create firstName: "Aulis", lastName: "Homelius", email: "ohtupvmteam2@gmail.com"
student5 = Student.create firstName: "Asko", lastName: "Vilenius", email: "ohtupvmteam3@gmail.com"
student6 = Student.create firstName: "Sam", lastName: "Makkonen", email: "ohtupvmteam4@gmail.com"
student7 = Student.create firstName: "Rivo", lastName: "Riitta", email: "ohtupvmteam5@gmail.com"
student8 = Student.create firstName: "Inkeri", lastName: "Kääriäinen", email: "ohtupvmteam6@gmail.com"
student9 = Student.create firstName: "Gootti", lastName: "Kusta"

course1.students << student1
course1.students << student2
course1.students << student3
course1.students << student4
course1.students << student5
course1.students << student6
course1.students << student7
course1.students << student8
course1.students << student9

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

course1.assignments.each do |assignment|
	assignment.name = "tehtävä" + assignment.number.to_s
	assignment.save
end

assignment1.location = Location.create x: 256, y: 664
assignment2.location = Location.create x: 386, y: 718
assignment3.location = Location.create x: 669, y: 634
assignment4.location = Location.create x: 963, y: 717
assignment5.location = Location.create x: 877, y: 428
assignment6.location = Location.create x: 651, y: 333
assignment7.location = Location.create x: 484, y: 357
assignment8.location = Location.create x: 78, y: 472
assignment9.location = Location.create x: 195, y: 162

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
