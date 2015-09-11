require 'rails_helper'

describe Course do
  describe "when course is created" do
    
    it "it is saved to database" do
      course = FactoryGirl.create :course
      expect(Course.count) == 1
    end

  end
end
