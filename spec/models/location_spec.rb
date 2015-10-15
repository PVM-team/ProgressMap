require 'rails_helper'

describe Location, type: :model do

  describe "with valid attributes" do

    it "the location can be saved to database" do
      count = Location.count
      FactoryGirl.create :location

      expect(Location.count).to be(count + 1)

      FactoryGirl.create :location, y: -100

      expect(Location.count).to be(count + 2)
    end
  end

  describe "with invalid attributes" do

    it "the location can not be saved to database" do
      assure_location_is_invalid(-1, 0)
    end
  end  
end

def assure_location_is_invalid(x, y)
    count = Location.count

    begin
      FactoryGirl.create(:location, x: x, y: y)
    rescue
    end

    expect(Location.count).to be(count)
end