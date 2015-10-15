require 'rails_helper'

describe Student, type: :model do

  describe "when a valid student is created" do

    it "is saved to database" do
      count = Student.count
      FactoryGirl.create :student

      expect(Student.count).to be(count + 1)
    end
  end

  describe "when a use without either one of the names is created" do
    
    it "it is not saved to database" do
      count = Student.count
      msg = ""
      msg2 = ""

      begin
        FactoryGirl.create :student, firstName: ""
      rescue ActiveRecord::RecordInvalid => e
        msg = e.message
      end

      begin
        FactoryGirl.create :student, lastName: ""
      rescue ActiveRecord::RecordInvalid => e
        msg2 = e.message
      end

      expect(Student.count).to be(count)
      expect(msg.include? "Validation failed").to be(true)
      expect(msg2.include? "Validation failed").to be(true)
    end
  end

  describe "when a student is deleted" do

    before :each do
      @student = FactoryGirl.create :student
      @course = FactoryGirl.create :course

      @course.students << @student

      for i in 1..3
        @student.assignments << (FactoryGirl.create :assignment)
      end
    end

    it "it is removed from database" do
      count = Student.count
      @student.destroy

      expect(Student.count).to be(count - 1)
    end

    it "all completed tasks associated with it are deleted" do
      expect(StudentsTask.count).to be(3)

      @student.destroy
      expect(StudentsTask.count).to be(0)
    end

    it "the assignments are not deleted" do
      @student.destroy
      expect(Assignment.count).to be(3)
    end

    it "the course the student belongs to is not deleted" do
      @student.destroy
      expect(Course.count).to be(1)
    end
  end
end