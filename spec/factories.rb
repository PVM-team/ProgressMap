FactoryGirl.define do

  factory :course do
    course1 = Course.create
  end

  factory :user do
    student1 = User.new
  end
end