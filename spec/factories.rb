FactoryGirl.define do

  factory :course do
<<<<<<< HEAD
    course1 = Course.new
=======
    course1 = Course.new 	# ei 'createa' koskaan tänne. Tallettaa tietokantaan.
>>>>>>> cf22a8d7b69eed44817d0b90eaa165b3df230113
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