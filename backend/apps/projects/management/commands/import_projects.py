from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.projects.models import Project
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Import NexVentures projects from the August 2025 allocation document'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting project import...'))
        password = 'f@9M#tG6kQ1xVw!z'
        
        # Create or get users
        dev_team_user, _ = User.objects.get_or_create(
            username='devteam',
            defaults={
                'first_name': 'Development',
                'last_name': 'Team',
                'email': 'tech@nexventures.net',
                'password': 'f@9M#tG6kQ1xVw!z'
            }
        )
        
        michael_user, _ = User.objects.get_or_create(
            username='michael',
            defaults={
                'first_name': 'Alain Michael',
                'last_name': 'Muhirwa',
                'email': 'amuhirwa@nexventures.net',
                'password': 'f@9M#tG6kQ1xVw!z'

            }
        )
        
        daniel_user, _ = User.objects.get_or_create(
            username='daniel',
            defaults={
                'first_name': 'Daniel',
                'last_name': 'Iryivuze',
                'email': 'daniel@nexventures.net',
                'password': 'f@9M#tG6kQ1xVw!z'

            }
        )
        
        christian_user, _ = User.objects.get_or_create(
            username='christian',
            defaults={
                'first_name': 'Loue Sauveur',
                'last_name': 'Christian',
                'email': 'christian@nexventures.net',
                'password': 'f@9M#tG6kQ1xVw!z'

            }
        )
        
        david_user, _ = User.objects.get_or_create(
            username='david',
            defaults={
                'first_name': 'David',
                'last_name': 'Niyonshuti',
                'email': 'david@nexventures.net',
                'password': 'f@9M#tG6kQ1xVw!z'

            }
        )

        # Projects data
        projects_data = [
            {
                'title': 'Centerpiece web and mobile app',
                'description': 'Centerpiece Expenditure & Events Tracker application. The system will replace manual spreadsheets and provide a mobile (Flutter) and web-based solution for recording income, expenditure, and event-based finances, while enabling analytics, reporting, and MoMo payment integration.',
                'client_name': 'Center Piece Ltd',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 10, 12).date(),
                'status': 'in_progress',
                'priority': 'high',
                'created_by': michael_user,
            },
            {
                'title': 'beBrivus',
                'description': 'A single AI-powered hub that connects students/graduates with global opportunities (scholarships, fellowships, internships, programs)',
                'client_name': 'Gabriel KHOT',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 9, 30).date(),
                'status': 'in_progress',
                'priority': 'high',
                'created_by': michael_user,
            },
            {
                'title': 'Zedera',
                'description': 'A portfolio website showcasing the services provided by zedera intended for ethiopia audience.',
                'client_name': 'Zedera',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 9, 11).date(),
                'status': 'completed',
                'priority': 'high',
                'created_by': michael_user,
                'completed_date': datetime(2025, 9, 11).date(),
            },
            {
                'title': 'Enebulla',
                'description': 'Energy-related platform, final touches being done.',
                'client_name': 'Moise',
                'assigned_to': daniel_user,
                'due_date': datetime(2025, 9, 5).date(),
                'status': 'completed',
                'priority': 'high',
                'created_by': michael_user,
                'completed_date': datetime(2025, 9, 5).date(),
            },
            {
                'title': 'R Construction Proposal',
                'description': 'Business proposal for a construction project.',
                'client_name': 'Robert',
                'assigned_to': michael_user,
                'due_date': datetime(2025, 8, 22).date(),
                'status': 'completed',
                'priority': 'high',
                'created_by': michael_user,
                'completed_date': datetime(2025, 8, 22).date(),
            },
            {
                'title': 'Hesed Events Dashboard',
                'description': 'Event management dashboard platform for Hesed.',
                'client_name': 'Didier',
                'assigned_to': michael_user,
                'due_date': datetime(2025, 8, 22).date(),
                'status': 'in_progress',
                'priority': 'high',
                'created_by': michael_user,
            },
            {
                'title': 'Fadhar Restaurant',
                'description': 'Development of a digital presence/website for the restaurant.',
                'client_name': 'Duktep',
                'assigned_to': christian_user,
                'due_date': datetime(2025, 8, 24).date(),
                'status': 'in_progress',
                'priority': 'high',
                'created_by': michael_user,
            },
            {
                'title': 'Umukamezi / NexShop',
                'description': 'Development of an e-commerce platform for Khadafi.',
                'client_name': 'Khadafi',
                'assigned_to': david_user,
                'due_date': datetime(2025, 8, 5).date(),
                'status': 'in_progress',
                'priority': 'medium',
                'created_by': michael_user,
            },
            {
                'title': 'Quincaillerie E-Commerce',
                'description': 'Template-based e-commerce proposal.',
                'client_name': 'General Proposal',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 8, 25).date(),
                'status': 'planning',
                'priority': 'medium',
                'created_by': michael_user,
            },
            {
                'title': 'Flat Production Website Revamp',
                'description': 'Revamp and modernization of the company\'s website.',
                'client_name': 'Khadafi',
                'assigned_to': daniel_user,
                'due_date': datetime(2025, 8, 25).date(),
                'status': 'planning',
                'priority': 'medium',
                'created_by': michael_user,
            },
            {
                'title': 'NexVentures Portfolio',
                'description': 'Creating a portfolio showcasing NexVentures\' work and services.',
                'client_name': 'NexVentures',
                'assigned_to': michael_user,
                'due_date': datetime(2025, 8, 26).date(),
                'status': 'planning',
                'priority': 'normal',
                'created_by': michael_user,
            },
            {
                'title': 'NexVentures Website Renovation',
                'description': 'Updating and improving NexVentures\' official website.',
                'client_name': 'NexVentures',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 8, 27).date(),
                'status': 'planning',
                'priority': 'normal',
                'created_by': michael_user,
            },
            {
                'title': 'NexStudio (Revamp of Umukamezi Web)',
                'description': 'Revamp of previous Umukamezi site, rebranded as "NexStudio" to propose to other clients.',
                'client_name': 'Multiple Clients',
                'assigned_to': daniel_user,
                'due_date': datetime(2025, 8, 28).date(),
                'status': 'planning',
                'priority': 'normal',
                'created_by': michael_user,
            },
            {
                'title': 'DHP System Changes',
                'description': 'Implementing new requested changes for DHP systems.',
                'client_name': 'Clever DHP',
                'assigned_to': dev_team_user,
                'due_date': datetime(2025, 8, 31).date(),
                'status': 'planning',
                'priority': 'normal',
                'created_by': michael_user,
            },
            {
                'title': 'ADEPR Web Proposal',
                'description': 'Website proposal for ADEPR Rwanda organization.',
                'client_name': 'ADEPR Rwanda',
                'assigned_to': dev_team_user,
                'due_date': None,
                'status': 'planning',
                'priority': 'low',
                'created_by': michael_user,
            },
            {
                'title': 'Competitor & Client System Analysis',
                'description': 'Competitive analysis by identifying weaknesses in competitors\' systems and proposing alternatives.',
                'client_name': 'Multiple Clients',
                'assigned_to': david_user,
                'due_date': None,
                'status': 'in_progress',
                'priority': 'low',
                'created_by': michael_user,
            },
            {
                'title': 'NVMS (NexVentures Management System)',
                'description': 'Internal management system template for NexVentures operations.',
                'client_name': 'NexVentures',
                'assigned_to': dev_team_user,
                'due_date': None,
                'status': 'in_progress',
                'priority': 'medium',
                'created_by': michael_user,
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults=project_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created project: {project.title}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Project already exists: {project.title}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Import completed! Created: {created_count}, Existing: {updated_count}'
            )
        )
