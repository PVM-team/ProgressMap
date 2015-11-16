require 'rails_helper'

describe Assignment, type: :model do

  describe "when a valid assignment is created" do

    before :each do
      FactoryGirl.create :assignment
    end

    it "it is saved to database" do
      expect(Assignment.count).to be(1)
    end

    it "it is given assignment number as name" do
      expect(Assignment.first.name).to eq("1")
    end
  end

  describe "when an invalid assignment is created" do
    
    it "it is not saved to database" do
      count = Assignment.count
      msg = ""

      begin
        FactoryGirl.create :assignment, number: 0
      rescue ActiveRecord::RecordInvalid => e
        msg = e.message
      end

      expect(Assignment.count).to be(count)
      expect(msg.include? "Validation failed").to be(true)
    end
  end

  describe "when an assignment is deleted" do

    before :each do
      @assignment = FactoryGirl.create :assignment
      @assignment.location = FactoryGirl.create :location
      @assignment.course = FactoryGirl.create :course

      for i in 1..3
        student = FactoryGirl.create :student

        if i < 3
          @assignment.attempters << student
        else
          student.assignments << (FactoryGirl.create :assignment)
        end  
      end
    end

    it "it is removed from database" do
      count = Assignment.count
      @assignment.destroy

      expect(Assignment.count).to be(count - 1)
    end

    it "all tasks associated with it are deleted" do
      expect(StudentsTask.count).to be(3)

      @assignment.destroy
      expect(StudentsTask.count).to be(1)
    end

    it "the location of the assignment is deleted" do
      assignment2 = FactoryGirl.create :assignment
      assignment2.location = FactoryGirl.create :location
      expect(Location.count).to be(2)

      @assignment.destroy
      expect(Location.count).to be(1)
      expect(Location.first.assignment).to eq(assignment2)
    end

    it "the doers are not deleted" do
      @assignment.destroy
      expect(Student.count).to be(3)
    end

    it "the course of the assignment is not deleted" do
      @assignment.destroy
      expect(Course.count).to be(1)
    end
  end

  describe "dependencies returns" do

    before :each do
      @assignment1 = FactoryGirl.create :assignment
    end

    it "an empty array if assignment has no dependencies" do
      expect(@assignment1.dependencies).to eq([])
    end

    it "the dependencies of the assignment if assignment has dependencies" do
      assignment2 = FactoryGirl.create :assignment
      assignment3 = FactoryGirl.create :assignment

      assignment3.dependencies << @assignment1
      assignment3.dependencies << assignment2
      assignment2.dependencies << @assignment1

      expect(assignment2.dependencies.length).to be(1)
      expect(assignment3.dependencies.length).to be(2)

      expect(assignment3.dependencies[0]).to eq(@assignment1)
      expect(assignment3.dependencies[1]).to eq(assignment2)
    end
  end

  describe "when a few assinments are added to a course" do

    before :each do
      @course = FactoryGirl.create :course

      for i in 1..3
        @course.assignments << (FactoryGirl.create :assignment, number: i)  
      end
    end

    describe "and the names of them are initialized to 'task1', 'tehtävä2' and 'kolomonen'" do
      
      before :each do
        names = ["task1", "tehtävä2", "kolomonen"]

        for i in 0.. names.length - 1 do
          assignment = @course.assignments[i]
          assignment.name = names[i]
          assignment.save
        end

        expect(@course.assignments.second.name).to eq("tehtävä2")
        expect(@course.assignments.third.name).to eq("kolomonen")

        @second = @course.assignments.second
      end

      it "'tehtävä2' cannot be renamed to 'kolomonen'" do
        @second.name = "kolomonen"
        expect(@second.name).to eq("kolomonen")

        begin
          @second.save
        rescue Exception => e # validation error
        end

        expect(Course.first.assignments.second.name).to eq("tehtävä2")
      end

      it "'tehtävä2' can be renamed to 'kakkonen'" do
        @second.name = "kakkonen"
        @second.save

        expect(Course.first.assignments.second.name).to eq("kakkonen")
      end
    end
  end

  describe "when two courses are created with a few assignments" do

    before :each do
      @course1 = FactoryGirl.create :course
      @course2 = FactoryGirl.create :course, name: "toinen"

      @assignments_in_total = 6

      for i in 1..3
        @course1.assignments << (FactoryGirl.create :assignment, number: i)
        @course2.assignments << (FactoryGirl.create :assignment, number: i)
      end
    end

    it "no validation error was thrown although they have assignments with same names" do
      expect(Assignment.count).to be(@assignments_in_total)

      expect(@course1.assignments.first.name).to eq(@course2.assignments.first.name)
      expect(@course1.assignments.second.name).to eq(@course2.assignments.second.name)
      expect(@course1.assignments.third.name).to eq(@course2.assignments.third.name)
    end

  end
end