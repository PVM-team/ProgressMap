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

    it "it has a random UUID as token" do
      expect(@course.token.length).to be(SecureRandom.uuid.length)
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
  		@student1 = FactoryGirl.create :student
  		@student2 = FactoryGirl.create :student
  		@assignment1 = FactoryGirl.create :assignment, name: "tehtävä1", number: 1

  		@course.assignments << @assignment1
  		@course.assignments << (FactoryGirl.create :assignment, name: "tehtävä2", number: 2)
  		FactoryGirl.create :assignment, name: "tehtävä1", number: 1

  		@course.students << @student1
  		@course.students << @student2
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

  	it "the students of the course are deleted" do
  		@course.destroy
  		expect(Student.count).to be(0)
  	end
  end
end