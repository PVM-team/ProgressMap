FactoryGirl.define do

  factory :course do
    name "course"
  end

  factory :user do
    firstName "first"
    lastName "last"
  end

  factory :assignment do
    number 1
  end

  factory :location do
    x 0
    y 0
  end
end