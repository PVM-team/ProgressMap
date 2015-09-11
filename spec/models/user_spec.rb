require 'rails_helper'

describe User, type: :model do

  describe "when a valid user is created" do

    it "is saved to database" do
      count = User.count
      FactoryGirl.create :user

      expect(User.count).to be(count + 1)
    end
  end


  describe "when a user is deleted" do

    before :each do
      @user = FactoryGirl.create :user

      for i in 1..3
        @user.courses << (FactoryGirl.create :course)
        @user.assignments << (FactoryGirl.create :assignment)
      end
    end

    it "it is removed from database" do
      count = User.count
      @user.destroy

      expect(User.count).to be(count - 1)
    end

    it "all completed tasks associated with it are deleted" do
      expect(StudentsTask.count).to be(3)

      @user.destroy
      expect(StudentsTask.count).to be(0)
    end

    it "all memberships associated with it are deleted" do
      Course.first.participants << (FactoryGirl.create :user)
      expect(Membership.count).to be(4)

      @user.destroy
      expect(Membership.count).to be(1)
    end

    it "the assignments are not deleted" do
      @user.destroy
      expect(Assignment.count).to be(3)
    end

    it "the courses are not deleted" do
      @user.destroy
      expect(Course.count).to be(3)
    end
  end


  describe "when completed_assignments is called" do

    before :each do
      @user = FactoryGirl.create :user
      @course = FactoryGirl.create :course
    end

    it "initially returns an empty array" do
      expect(@user.completed_assignments(@course)).to eq([])
    end

    it "returns the list of done assignments when some are done" do
      course2 = FactoryGirl.create :course
      assignment1 = FactoryGirl.create :assignment
      assignment2 = FactoryGirl.create :assignment
      assignment3 = FactoryGirl.create :assignment

      add_assignment_to_course(@course, assignment1)
      add_assignment_to_course(course2, assignment2)
      add_assignment_to_course(course2, assignment3)

      @user.assignments << assignment2
      @user.assignments << assignment3

      expect(@user.completed_assignments(@course).length).to be(0)
      expect(@user.completed_assignments(course2).length).to be(2)
    end
  end
end

def add_assignment_to_course(course, assignment)
  course.assignments << assignment
end