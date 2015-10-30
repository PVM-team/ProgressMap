require 'rails_helper'

describe "Course editing page", js: true do

    before :all do
        self.use_transactional_fixtures = false
    end

    before :each do
        DatabaseCleaner.strategy = :truncation
        DatabaseCleaner.start

        @course = FactoryGirl.create :course, name: "Ohtuprojekti"

        assignment1 = FactoryGirl.create :assignment, number: 1
        assignment1.location = (FactoryGirl.create :location, x: 125, y: 160)
        assignment2 = FactoryGirl.create :assignment, number: 2
        assignment2.location = (FactoryGirl.create :location, x: 425, y: 104)
        assignment3 = FactoryGirl.create :assignment, number: 3
        assignment3.location = (FactoryGirl.create :location, x: 725, y: 201)
        assignment4 = FactoryGirl.create :assignment, number: 4
        assignment4.location = (FactoryGirl.create :location, x: 999, y: 137)

        @course.assignments << assignment1
        @course.assignments << assignment2
        @course.assignments << assignment3
        @course.assignments << assignment4
    end

    after :each do
        DatabaseCleaner.clean
    end

    after :all do
        self.use_transactional_fixtures = true
    end

    describe "when course editing page is visited" do

        before :each do
            visit_course_editing_page
        end

        it 'it shows dependencies view' do
            expect(find('#assignmentView')).to have_content('Edit dependencies')
        end

        describe "and dependency is added to assignment" do
            before :each do
               fields = page.find("#assignmentView").all("input")
                fields[1].set('2')
            end

            describe "and Change assignments dependencies button is clicked" do
                before :each do
                    page.find("#assignmentView").first("button", :text => "Change Assignment's Dependencies").click
                end
                it "it adds the dependency to database" do
                    assignment = @course.assignments.first
                    assignment2 = @course.assignments.second
                    expect(assignment.dependencies).to include(assignment2);
                end
                describe "and after visiting main page and back to edit page" do
                    before :each do
                        visit_course_editing_page
                    end
                    it "dependency is written in the right input field" do
                      fields = page.find("#assignmentView").all("input")
                      expect(fields[1].value).to eq('2'); 
                    end
                end
            end
        end
            
    end
end



def visit_course_editing_page
    visit '/'
    click_button 'Edit course'
end
