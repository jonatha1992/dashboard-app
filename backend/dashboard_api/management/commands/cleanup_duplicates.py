from django.core.management.base import BaseCommand
from django.db import models, transaction
from dashboard_api.models import GeografiaProcedimiento
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clean up duplicate GeografiaProcedimiento records, keeping only one per unique procedure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', 
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando limpieza de duplicados en GeografiaProcedimiento'))
        
        # Count total records before
        total_before = GeografiaProcedimiento.objects.count()
        self.stdout.write(f'Registros totales antes: {total_before}')
        
        # Find duplicates (same id_operativo and id_procedimiento)
        duplicates = GeografiaProcedimiento.objects.values(
            'id_operativo', 'id_procedimiento'
        ).annotate(
            count=models.Count('id')
        ).filter(count__gt=1).order_by('-count')
        
        duplicate_groups = list(duplicates)
        total_duplicate_groups = len(duplicate_groups)
        
        if total_duplicate_groups == 0:
            self.stdout.write(self.style.SUCCESS('No se encontraron duplicados'))
            return
        
        self.stdout.write(f'Encontrados {total_duplicate_groups} grupos de duplicados')
        
        records_to_delete = 0
        records_to_keep = 0
        
        # Show sample duplicates
        self.stdout.write('\nMuestra de duplicados encontrados:')
        for i, dup in enumerate(duplicate_groups[:5]):
            self.stdout.write(
                f'  {i+1}. {dup["id_operativo"]}_{dup["id_procedimiento"]} - {dup["count"]} registros'
            )
        
        if not options['dry_run']:
            with transaction.atomic():
                for dup_group in duplicate_groups:
                    id_operativo = dup_group['id_operativo']
                    id_procedimiento = dup_group['id_procedimiento']
                    count = dup_group['count']
                    
                    # Get all records for this duplicate group
                    records = GeografiaProcedimiento.objects.filter(
                        id_operativo=id_operativo,
                        id_procedimiento=id_procedimiento
                    ).order_by('id')  # Keep the first one (lowest ID)
                    
                    # Keep the first record, delete the rest
                    records_to_keep += 1
                    records_to_delete += (count - 1)
                    
                    # Delete all but the first
                    records_to_delete_objects = records[1:]  # Skip first record
                    for record in records_to_delete_objects:
                        record.delete()
            
            # Count after cleanup
            total_after = GeografiaProcedimiento.objects.count()
            
            self.stdout.write(self.style.SUCCESS(f'\nLimpieza completada:'))
            self.stdout.write(f'  Registros antes: {total_before}')
            self.stdout.write(f'  Registros despues: {total_after}')
            self.stdout.write(f'  Registros eliminados: {records_to_delete}')
            self.stdout.write(f'  Registros conservados: {records_to_keep}')
            self.stdout.write(f'  Reduccion: {((total_before - total_after) / total_before * 100):.1f}%')
            
        else:
            # Dry run - calculate what would happen
            for dup_group in duplicate_groups:
                count = dup_group['count']
                records_to_keep += 1
                records_to_delete += (count - 1)
            
            self.stdout.write(self.style.WARNING(f'\nSIMULACION (--dry-run):'))
            self.stdout.write(f'  Registros actuales: {total_before}')
            self.stdout.write(f'  Se eliminarian: {records_to_delete}')
            self.stdout.write(f'  Se conservarian: {records_to_keep}')
            self.stdout.write(f'  Reduccion estimada: {(records_to_delete / total_before * 100):.1f}%')
            self.stdout.write(f'\nPara ejecutar la limpieza real, ejecute: python manage.py cleanup_duplicates')
