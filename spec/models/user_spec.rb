require 'rails_helper'

describe User do
  it "creates user for correct course" do
    course = FactoryGirl.create(:course)
    user = FactoryGirl.create(:user)
    course.participants << user

    expect(course.participants.length).to be(1)
  end
end
