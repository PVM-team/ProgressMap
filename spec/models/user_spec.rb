require 'rails_helper'

describe User, type: :model do

  before :each do
    @course = FactoryGirl.create :course
    @user = FactoryGirl.create :user
  end

  it "creates user for correct course" do
    @course.participants << @user
    expect(@course.participants.length).to eq(1)
  end

  describe "when completed assignments is called" do

    it "returns empty list if no courses are completed" do
      completed = @user.completed_assignments(@course)
      expect(completed.length).to eq(0)
    end

    it "returns completed assignments when some are done" do
      course2 = FactoryGirl.create :course
      assignment1 = FactoryGirl.create :assignment
      assignment2 = FactoryGirl.create :assignment
      assignment3 = FactoryGirl.create :assignment

      add_assignment(@course, assignment1)
      add_assignment(course2, assignment2)
      add_assignment(course2, assignment3)

      @user.assignments << assignment1
      @user.assignments << assignment2

      expect(@user.completed_assignments(@course).length).to eq(1)
      expect(@user.completed_assignments(course2).length).to eq(1)
    end
  end
end

def add_assignment(course, assignment)
  course.assignments << assignment
end