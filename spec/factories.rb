FactoryGirl.define do

  factory :course do
    course1 = Course.new
  end

  factory :user do
    student1 = User.new
  end

  factory :assignment do
    assignment1 = Assignment.new
  end

  factory :location do
    Location.create x: 10, y: 25
  end

end