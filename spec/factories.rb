require 'securerandom'

FactoryGirl.define do

  factory :course do
    name "course"
  end

  factory :student do
    firstName "first"
    lastName "last"
  end

  factory :assignment do
  end

  factory :location do
    x 0
    y 0
  end
end