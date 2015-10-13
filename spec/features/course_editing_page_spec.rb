require 'rails_helper'

describe "Course editing page", js: true do

    before :all do
        self.use_transactional_fixtures = false
    end

    before :each do
        DatabaseCleaner.strategy = :truncation
        DatabaseCleaner.start

        @erkki = FactoryGirl.create :user, firstName: "Erkki", lastName: "Mäkelä"
        FactoryGirl.create :user, firstName: "Mauno", lastName: "Tamminen"
        FactoryGirl.create :user, firstName: "Etunimi", lastName: "Sukunimi"

        @course = FactoryGirl.create :course, name: "Ohtuprojekti"
        @course.participants << (FactoryGirl.create :user, firstName: "Mauno", lastName: "Tammi")

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

        #@course2 = FactoryGirl.create :course, name: "Iso kurssi"

        #for i in 1..499 do
        #    a = FactoryGirl.create :assignment, number: 1
        #    a.location = FactoryGirl.create :location, x: i, y: i

        #    @course2.assignments << a
        #end
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

        it "it shows the name of the course to be edited" do
            expect(page).to have_content "Edit course Ohtuprojekti"
        end

        it "there is a canvas" do
            page.find('canvas')
        end

        it "the name of the course is shown in the course name text box" do
            input_fields = page.all("input")
            amount = input_fields.length

            found = false
            enumerator = input_fields.each

            for i in 1..amount
                elem = enumerator.next
                found = true if elem[:value] === 'Ohtuprojekti'
            end

            expect(found).to be(true)
        end

        it "it shows all the participants" do
            expect(find("#participants")).to have_content('Mauno Tammi')
            expect(find("#participants")).not_to have_content('Erkki Mäkelä')
            expect(find("#participants")).not_to have_content('Mauno Tamminen')
            expect(find("#participants")).not_to have_content('Etunimi Sukunimi')
        end

        it "it shows all the users not in course" do
            expect(find("#resultview")).not_to have_content('Mauno Tammi Add to course')
            expect(find("#resultview")).to have_content('Erkki Mäkelä')
            expect(find("#resultview")).to have_content('Mauno Tamminen Add to course')
            expect(find("#resultview")).to have_content('Etunimi Sukunimi')
        end

        it 'it shows an assignment in assignmentView' do
            expect(find('#assignmentView')).to have_content('Id: 1, Number: 1')
        end

        it "it shows a button related to the assignment" do
            page.find('button', :text => '1')
        end

        describe "and name of the course is changed inside the course name text box" do

            before :each do
                fill_in('courseName', with: 'Uus kurssi')
            end

            describe "and the Change name button is clicked" do

                before :each do
                    click_button 'Change name'
                end

                it "the name of the course is changed in view" do
                    expect(page).to have_content 'Edit course Uus kurssi'
                end

                it "the name of the course is changed in database" do
                    expect(Course.first.name).to eq('Uus kurssi')
                end
            end
        end

        describe "when first name and last name fields are filled with text" do

            before :each do
                fill_in('firstName', with: 'u')
                fill_in('lastName', with: 'mmi')
            end

            it "it finds the users not in course whose first name and last name have those strings as substrings" do
                expect(find("#resultview")).to have_content('Mauno Tamminen Add to course')
                expect(find("#resultview")).not_to have_content('Erkki Mäkelä')
                expect(find("#resultview")).not_to have_content('Mauno Tammi Add to course') # shown as participant
            end
        end

        describe "when a user is added to course" do

            before :each do
                @participants_on_course = @course.participants.length
                @original_membership_count = Membership.count

                fill_in('firstName', with: 'Erkki')
                click_button 'Add to course' # Erkki Mäkelä lisätään kurssille
            end

            it "the user will be shown in participants list" do
                expect(page.find("#participants")).to have_content('Erkki Mäkelä')
            end

            it "the user won't be shown in resultview" do
                expect(page.find("#resultview").text).to be_empty
            end

            it "a new membership between that user and the edited course is created" do
                expect(Membership.count).to be(@original_membership_count + 1)

                course = Course.first

                expect(course.participants.length).to be(@participants_on_course + 1)
                expect(course.participants[course.participants.length - 1]).to eq(@erkki)
            end
        end

        describe "when a user is removed from the course" do

            before :each do
                @participants_on_course = @course.participants.length
                @original_membership_count = Membership.count
                click_button 'Delete participant'
            end

            it "deletes the participant from participantlist" do
                expect(find("#participants")).not_to have_content('Mauno Tammi')
            end

            it "adds the participant to all users when deleted" do
                expect(find("#resultview")).to have_content('Mauno Tammi Add to course')

            end

            it "membership between deleted user and edited course is deleted" do
                expect(Membership.count).to be(@original_membership_count - 1)
                course = Course.first
                expect(course.participants.length).to be(@participants_on_course - 1)
            end
        end


        describe 'when an assignment is added to course' do

            before :each do
                @assignments_initially = @course.assignments.length

                expect(find('#assignmentView')).not_to have_content('Number: 5')
                click_button 'Add a new assignment'
            end

            it 'a new assignment is added to assignmentView' do
                expect(find('#assignmentView')).to have_content('Number: 5')
            end

            it "the added assignment is shown as a button on the map" do
                page.find('button', :text => '5')
            end

            it "the added assignment is located in correct block" do
                assignment_count = 5
                direction = "left"
                button = find_button(assignment_count.to_s)
                x_loc = x_loc(button)
                y_loc = y_loc(button)
                validate_location(x_loc, y_loc, assignment_count - 1, assignment_count, direction)
            end

            it "a new assignment is added to database" do
                expect(Course.first.assignments.length).to be(@assignments_initially + 1)
            end
        end

        describe 'when an assignment is deleted' do
            
            before :each do
                @assignments_initially = @course.assignments.length
                expect(find('#assignmentView')).to have_content('Id: 4, Number: 4')
                click_button('Delete assignment', match: :first)
            end

            it "assignmentView won't contain the deleted assignment" do
                expect(find('#assignmentView')).not_to have_content('Id: 4, Number: 4')
            end

            it 'the button related to the assignment is deleted' do
                found = false
                begin
                    page.find('button', :text => '5')
                    found = true
                rescue
                end

                expect(found).to be(false)
            end

            it 'the last assignment in map is in correct block after delete' do
                assignment_count = 3
                direction = "right"
                button = find_button(assignment_count.to_s)
                x_loc = x_loc(button)
                y_loc = y_loc(button)
                validate_location(x_loc, y_loc, assignment_count - 1, assignment_count, direction)
            end

            it "the assignment is removed from database" do
                expect(Course.first.assignments.length).to be(@assignments_initially - 1)
            end
        end

        describe "when all assignments are deleted" do

            before :each do
                for i in 1..@course.assignments.length do
                    click_button('Delete assignment', match: :first)
                end
            end

            it "there is no delete button" do
                expect(page).not_to have_button('Delete assignment')
            end

            describe "and when an assignment is added" do

                before :each do
                    page.find("button", :text => 'Add a new assignment').click
                end

                it "there is a delete button" do
                    expect(page).to have_button('Delete assignment', match: :first)
                end
            end
        end
    end
end

def visit_course_editing_page
    visit '/'
    click_button 'Edit course'
end

def x_loc(button)
    (button[:style].split("left: ")[1]).split("px")[0].to_i + 25
end

def y_loc(button)
    (button[:style].split("top: ")[1]).split("px")[0].to_i + 25
end

def validate_location(x_loc, y_loc, index, assignment_count, direction)
    border_size = 1000 / 40
    block_size = 1000 / 5
    left_border = 50 + 2 * border_size
    top_border = 50 + 2 * border_size

    assignments_per_level = 4
    level_amount = (assignment_count / assignments_per_level) + 1

    if (direction === 'right')
        x_start = left_border + (index % assignments_per_level) * (2 * border_size + block_size)
    else
        x_start = left_border - (index % assignments_per_level) * (2 * border_size + block_size) + (assignments_per_level - 1) * (2 * border_size + block_size)
    end

    y_start = top_border + ((level_amount - (index / assignments_per_level)).ceil - 1) * (2 * border_size + block_size)

    expect(x_loc >= x_start && x_loc < x_start + block_size).to be(true)
    expect(y_loc >= y_start && y_loc < y_start + block_size).to be(true)
end