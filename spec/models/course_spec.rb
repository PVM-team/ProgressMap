require 'rails_helper'

describe Course, type: :model do
  
  before :each do
  	@course = FactoryGirl.create :course
  end

  describe "when a valid course is created" do
    
    it "it is saved to database" do
      count = Course.count
		  FactoryGirl.create :course

		  expect(Course.count).to be(count + 1)
    end
  end

  describe "when an invalid course is created" do
    
    it "it is not saved to database" do
      count = Course.count
      msg = ""

      begin
        FactoryGirl.create :course, name: ""
      rescue ActiveRecord::RecordInvalid => e
        msg = e.message
      end

      expect(Course.count).to be(count)
      expect(msg.include? "Validation failed").to be(true)
    end
  end

  describe "when a course is deleted" do

  	before :each do
  		@student1 = FactoryGirl.create :user
  		@student2 = FactoryGirl.create :user
  		@assignment1 = FactoryGirl.create :assignment

  		@course.assignments << @assignment1
  		@course.assignments << (FactoryGirl.create :assignment)
  		FactoryGirl.create :assignment

  		@course.participants << @student1
  		@course.participants << @student2
  	end

  	it "it is removed from database" do
  		count = Course.count
  		@course.destroy

  		expect(Course.count).to be(count - 1)
  	end

  	it "all assignments associated with it are deleted" do
  		@course.destroy
  		expect(Assignment.count).to be(1)
  	end

  	it "all memberships associated with it are deleted" do
  		expect(Membership.count).to be(2)

  		@course.destroy
  		expect(Membership.count).to be(0)
  	end

  	it "the participants of the course are not deleted" do
  		@course.destroy
  		expect(User.count).to be(2)
  	end
  end
end