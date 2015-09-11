FactoryGirl.define do

  factory :course do
    course1 = Course.new 	# ei 'createa' koskaan tänne. Tallettaa tietokantaan.
  end

  factory :user do
    student1 = User.new
  end

  factory :assignment do
    assignment1 = Assignment.new
  end

  factory :location do
    Location.new x: 10, y: 25
  end

end