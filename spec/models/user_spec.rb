require 'rails_helper'

describe User do

  let!(:course) { FactoryGirl.create :course}
  let!(:user) { FactoryGirl.create :user }

  it "creates user for correct course" do
    course.participants << user

    expect(course.participants.length).to be(1)
  end

  it "returns empty list if no courses are completed" do
    completed = user.completed_assignments(course)

    expect(completed.length).to be(0)
  end

  it "removes user from couse if user is deleted" do
    course.participants << user
    user.destroy
    expect(course.participants.length).to be(0) # aiai menee rikki :)
  end
end
