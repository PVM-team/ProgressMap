require 'rails_helper'

describe Assignment, type: :model do

  describe "when a valid assignment is created" do

    it "it is saved to database" do
      count = Assignment.count
      FactoryGirl.create :assignment

      expect(Assignment.count).to be(count + 1)
    end
  end

  describe "when an assignment is deleted" do

    before :each do
      @assignment = FactoryGirl.create :assignment
      @assignment.location = FactoryGirl.create :location
      @assignment.course = FactoryGirl.create :course

      for i in 1..3
        user = FactoryGirl.create :user

        if i < 3
          @assignment.doers << user
        else
          user.assignments << (FactoryGirl.create :assignment)
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
      expect(User.count).to be(3)
    end

    it "the course of the assignment is not deleted" do
      @assignment.destroy
      expect(Course.count).to be(1)
    end
  end
end