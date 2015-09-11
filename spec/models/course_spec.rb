require 'rails_helper'

describe Course do
  describe "course is created" do
    it "and saved to database" do
      course = FactoryGirl.create(:course)
      expect(Course.count) == 1
    end
  end
end
