require 'rails_helper'

describe Course do
  it "saves the course into database" do
    course = FactoryGirl.create(:course)
    expect(Course.count) == 1
  end
end
