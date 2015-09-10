FactoryGirl.define do

  factory :course do
    course1 = Course.new 	# ei 'createa' koskaan tänne. Tallettaa tietokantaan.
  end

  factory :user do
    student1 = User.new
  end
end