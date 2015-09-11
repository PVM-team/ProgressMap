require 'rails_helper'

describe User do

  before :each do
    @course = FactoryGirl.create :course
    @user = FactoryGirl.create :user
  end

  it "creates user for correct course" do
    @course.participants << @user

    expect(@course.participants.length).to be(1)
  end

  it "returns empty list if no courses are completed" do
    completed = @user.completed_assignments(@course)

    expect(completed.length).to be(0)
  end
end