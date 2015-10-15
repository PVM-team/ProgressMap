require 'rails_helper'

describe Assignment, type: :model do

  describe "when a valid assignment is created" do

    it "it is saved to database" do
      count = Assignment.count
      FactoryGirl.create :assignment

      expect(Assignment.count).to be(count + 1)
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
          @assignment.doers << student
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

    it "all completed tasks associated with it are deleted" do
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

  describe "dependencies" do

    before :each do
      @assignment1 = FactoryGirl.create :assignment
    end

    it "returns an empty array if assignment has no dependencies" do
      expect(@assignment1.dependencies).to eq([])
    end

    it "returns the dependencies of the assignment if assignment has dependencies" do
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
end