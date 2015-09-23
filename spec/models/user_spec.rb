require 'rails_helper'

describe User, type: :model do

  describe "when a valid user is created" do

    it "is saved to database" do
      count = User.count
      FactoryGirl.create :user

      expect(User.count).to be(count + 1)
    end
  end

  describe "when a use without either one of the names is created" do
    
    it "it is not saved to database" do
      count = User.count
      msg = ""
      msg2 = ""

      begin
        FactoryGirl.create :user, firstName: ""
      rescue ActiveRecord::RecordInvalid => e
        msg = e.message
      end

      begin
        FactoryGirl.create :user, lastName: ""
      rescue ActiveRecord::RecordInvalid => e
        msg2 = e.message
      end

      expect(User.count).to be(count)
      expect(msg.include? "Validation failed").to be(true)
      expect(msg2.include? "Validation failed").to be(true)
    end
  end

  describe "when a user is deleted" do

    before :each do
      @user = FactoryGirl.create :user

      for i in 1..3
        @user.courses << (FactoryGirl.create :course)
        @user.assignments << (FactoryGirl.create :assignment)
      end
    end

    it "it is removed from database" do
      count = User.count
      @user.destroy

      expect(User.count).to be(count - 1)
    end

    it "all completed tasks associated with it are deleted" do
      expect(StudentsTask.count).to be(3)

      @user.destroy
      expect(StudentsTask.count).to be(0)
    end

    it "all memberships associated with it are deleted" do
      Course.first.participants << (FactoryGirl.create :user)
      expect(Membership.count).to be(4)

      @user.destroy
      expect(Membership.count).to be(1)
    end

    it "the assignments are not deleted" do
      @user.destroy
      expect(Assignment.count).to be(3)
    end

    it "the courses are not deleted" do
      @user.destroy
      expect(Course.count).to be(3)
    end
  end
end