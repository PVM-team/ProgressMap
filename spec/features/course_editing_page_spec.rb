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

        assignment = FactoryGirl.create :assignment, number: 1
        assignment.location = (FactoryGirl.create :location, x: 125, y: 160)

        @course.assignments << assignment
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
                    expect(Course.count).to be(1)
                    course = Course.first

                    expect(course.name).to eq('Uus kurssi')
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

                expect(find('#assignmentView')).not_to have_content('Id: 2, Number: 2')
                click_button 'Add a new assignment'
            end

            it 'a new assignment is added to assignmentView' do
                expect(find('#assignmentView')).to have_content('Id: 2, Number: 2')
            end

            it "the added assignment is shown as a button on the map" do
                page.find('button', :text => '2')
            end

            it "a new assignment is added to database" do
                expect(Course.first.assignments.length).to be(@assignments_initially + 1)
            end
        end

        describe 'when an assignment is deleted' do
            before :each do
                @assignments_initially = @course.assignments.length

                expect(find('#assignmentView')).to have_content('Id: 1, Number: 1')
                click_button 'Delete assignment'
            end

            it "assignmentView won't contain the deleted assignment" do
                expect(find('#assignmentView')).not_to have_content('Id: 1, Number: 1')
            end

            it 'the button related to the assignment is deleted' do
                found = false
                begin
                    page.find('button', :text => '1')
                    found = true
                rescue
                end

                expect(found).to be(false)
            end

            it "the assignment is removed from database" do
                expect(Course.first.assignments.length).to be(@assignments_initially - 1)
            end
        end
    end
end

def visit_course_editing_page
    visit '/'
    click_button 'Edit course'
end