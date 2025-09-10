"""
Unit tests for Django models
Focus on data validation, processing, and business logic
"""

import pytest
from decimal import Decimal
from datetime import date, datetime
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from dashboard_api.models import (
    GeografiaProcedimiento,
    VehiculosPersonasControladas,
    DetenidosAprehendidos,
    Incautaciones,
    TrataTraficPersonas,
    OtrosDelitos,
    OtrosEventos,
    Fallecidos,
    Abatidos,
    CodigoOperativo
)

User = get_user_model()


class TestUserModel(TestCase):
    """Test custom User model"""
    
    def test_user_creation(self):
        """Test basic user creation"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='viewer'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'viewer')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_user_roles(self):
        """Test user role validation"""
        # Valid roles
        admin = User.objects.create_user(
            username='admin',
            password='pass',
            role='admin'
        )
        viewer = User.objects.create_user(
            username='viewer', 
            password='pass',
            role='viewer'
        )
        
        self.assertEqual(admin.role, 'admin')
        self.assertEqual(viewer.role, 'viewer')
    
    def test_user_string_representation(self):
        """Test user __str__ method"""
        user = User.objects.create_user(
            username='testuser',
            role='admin'
        )
        
        self.assertEqual(str(user), 'testuser (admin)')


class TestGeografiaProcedimientoModel(TestCase):
    """Test the main GeografiaProcedimiento model"""
    
    def test_basic_creation(self):
        """Test basic model creation"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            provincia='Buenos Aires',
            fecha='15/03/2025'
        )
        
        self.assertEqual(procedimiento.id_operativo, 'OP001')
        self.assertEqual(procedimiento.provincia, 'Buenos Aires')
    
    def test_provincia_key_normalization(self):
        """Test automatic provincia_key generation"""
        test_cases = [
            ('Buenos Aires', 'buenos aires'),
            ('Ciudad Autónoma de Buenos Aires', 'ciudad autonoma de buenos aires'),
            ('CABA', 'ciudad autonoma de buenos aires'),
            ('Córdoba', 'cordoba'),
            ('Tucumán', 'tucuman'),
            ('Capital Federal', 'ciudad autonoma de buenos aires'),
        ]
        
        for provincia_input, expected_key in test_cases:
            procedimiento = GeografiaProcedimiento.objects.create(
                id_operativo=f'OP{len(test_cases)}',
                id_procedimiento=f'PROC{len(test_cases)}',
                provincia=provincia_input
            )
            
            self.assertEqual(procedimiento.provincia_key, expected_key)
    
    def test_fecha_iso_parsing(self):
        """Test automatic fecha_iso generation from various formats"""
        test_cases = [
            ('15/03/2025', date(2025, 3, 15)),
            ('01/01/2025', date(2025, 1, 1)),
            ('2025-03-15', date(2025, 3, 15)),
            ('invalid-date', None),
            ('32/13/2025', None),
            ('', None),
            ('-', None),
        ]
        
        for fecha_input, expected_date in test_cases:
            procedimiento = GeografiaProcedimiento.objects.create(
                id_operativo=f'OP{test_cases.index((fecha_input, expected_date))}',
                id_procedimiento=f'PROC{test_cases.index((fecha_input, expected_date))}',
                fecha=fecha_input
            )
            
            self.assertEqual(procedimiento.fecha_iso, expected_date)
    
    def test_coordinate_validation(self):
        """Test coordinate field validation"""
        # Valid coordinates (Buenos Aires)
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            latitud=Decimal('-34.6037'),
            longitud=Decimal('-58.3816')
        )
        
        self.assertEqual(procedimiento.latitud, Decimal('-34.6037'))
        self.assertEqual(procedimiento.longitud, Decimal('-58.3816'))
    
    def test_invalid_coordinates(self):
        """Test invalid coordinate handling"""
        # This should not raise an exception at model level
        # Validation should happen at form/serializer level
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            latitud=Decimal('91'),  # Invalid latitude
            longitud=Decimal('181')  # Invalid longitude
        )
        
        # Model saves but coordinates are invalid
        self.assertEqual(procedimiento.latitud, Decimal('91'))
        self.assertEqual(procedimiento.longitud, Decimal('181'))
    
    def test_record_key_generation(self):
        """Test automatic record_key generation"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            hoja='GEOG'
        )
        
        expected_key = 'OP001_PROC001_GEOG'
        self.assertEqual(procedimiento.record_key, expected_key)
    
    def test_record_key_uniqueness(self):
        """Test record_key uniqueness constraint"""
        # First record
        GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            hoja='GEOG'
        )
        
        # Duplicate record_key should raise IntegrityError
        with self.assertRaises(IntegrityError):
            GeografiaProcedimiento.objects.create(
                id_operativo='OP001',
                id_procedimiento='PROC001', 
                hoja='GEOG'
            )
    
    def test_string_representation(self):
        """Test model __str__ method"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            descripcion='Control rutinario en ruta nacional'
        )
        
        self.assertEqual(str(procedimiento), 'OP001 - Control rutinario en ruta nacional')
    
    def test_normalize_provincia_static_method(self):
        """Test the static normalize_provincia method directly"""
        test_cases = [
            ('Buenos Aires', 'buenos aires'),
            ('CABA', 'ciudad autonoma de buenos aires'),
            ('Córdoba', 'cordoba'),
            ('', ''),
            (None, ''),
        ]
        
        for input_provincia, expected in test_cases:
            result = GeografiaProcedimiento.normalize_provincia(input_provincia)
            self.assertEqual(result, expected)
    
    def test_parse_fecha_static_method(self):
        """Test the static parse_fecha method directly"""
        test_cases = [
            ('15/03/2025', date(2025, 3, 15)),
            ('2025-03-15', date(2025, 3, 15)),
            ('invalid', None),
            ('', None),
            (None, None),
        ]
        
        for input_fecha, expected in test_cases:
            result = GeografiaProcedimiento.parse_fecha(input_fecha)
            self.assertEqual(result, expected)


class TestRelatedModels(TestCase):
    """Test models related to GeografiaProcedimiento"""
    
    def setUp(self):
        """Create a base procedimiento for testing"""
        self.procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            id_procedimiento='PROC001',
            provincia='Buenos Aires'
        )
    
    def test_vehiculos_controlados_creation(self):
        """Test VehiculosPersonasControladas model"""
        vehiculos = VehiculosPersonasControladas.objects.create(
            procedimiento=self.procedimiento,
            vehiculos_controlados=10,
            personas_controladas=25
        )
        
        self.assertEqual(vehiculos.vehiculos_controlados, 10)
        self.assertEqual(vehiculos.personas_controladas, 25)
        self.assertEqual(vehiculos.procedimiento, self.procedimiento)
    
    def test_detenidos_creation(self):
        """Test DetenidosAprehendidos model"""
        detenido = DetenidosAprehendidos.objects.create(
            procedimiento=self.procedimiento,
            edad=25,
            sexo='M',
            nacionalidad='Argentina',
            delito_imputado='Contrabando'
        )
        
        self.assertEqual(detenido.edad, 25)
        self.assertEqual(detenido.sexo, 'M')
        self.assertEqual(detenido.nacionalidad, 'Argentina')
    
    def test_incautaciones_creation(self):
        """Test Incautaciones model"""
        incautacion = Incautaciones.objects.create(
            procedimiento=self.procedimiento,
            tipo='Drogas',
            cantidad='10 kg',
            aforo=Decimal('50000.00')
        )
        
        self.assertEqual(incautacion.tipo, 'Drogas')
        self.assertEqual(incautacion.cantidad, '10 kg')
        self.assertEqual(incautacion.aforo, Decimal('50000.00'))
    
    def test_codigo_operativo_unique_relation(self):
        """Test CodigoOperativo OneToOne relationship"""
        codigo = CodigoOperativo.objects.create(
            procedimiento=self.procedimiento,
            codigo_operativo='COD001'
        )
        
        self.assertEqual(codigo.procedimiento, self.procedimiento)
        self.assertEqual(self.procedimiento.codigo_operativo, codigo)
        
        # Should not allow duplicate
        with self.assertRaises(IntegrityError):
            CodigoOperativo.objects.create(
                procedimiento=self.procedimiento,
                codigo_operativo='COD002'
            )
    
    def test_cascade_deletion(self):
        """Test that related models are deleted when procedimiento is deleted"""
        # Create related objects
        VehiculosPersonasControladas.objects.create(
            procedimiento=self.procedimiento,
            vehiculos_controlados=5
        )
        DetenidosAprehendidos.objects.create(
            procedimiento=self.procedimiento,
            edad=30
        )
        
        # Verify they exist
        self.assertEqual(self.procedimiento.vehiculos_controlados.count(), 1)
        self.assertEqual(self.procedimiento.detenidos.count(), 1)
        
        # Delete procedimiento
        self.procedimiento.delete()
        
        # Related objects should be deleted too
        self.assertEqual(VehiculosPersonasControladas.objects.count(), 0)
        self.assertEqual(DetenidosAprehendidos.objects.count(), 0)


class TestModelValidation(TestCase):
    """Test model validation and edge cases"""
    
    def test_empty_values_handling(self):
        """Test how models handle empty/null values"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='',  # Empty string
            id_procedimiento=None,  # Null
            provincia='',
            fecha='',
            latitud=None,
            longitud=None
        )
        
        # Should save without errors
        self.assertIsNotNone(procedimiento.pk)
        self.assertEqual(procedimiento.provincia_key, '')
        self.assertIsNone(procedimiento.fecha_iso)
    
    def test_very_long_strings(self):
        """Test handling of very long string values"""
        long_description = 'x' * 1000  # Very long description
        
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            descripcion=long_description
        )
        
        # Should truncate or handle gracefully
        self.assertIsNotNone(procedimiento.pk)
    
    def test_special_characters(self):
        """Test handling of special characters"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            descripcion='Operativo con símbolos especiales: áéíóú ñ ¿¡ ()[]{}',
            provincia='Río Negro',
            direccion='Calle 123 & Avenida Principal #456'
        )
        
        self.assertIsNotNone(procedimiento.pk)
        self.assertEqual(procedimiento.provincia_key, 'rio negro')
    
    def test_unicode_handling(self):
        """Test Unicode character handling"""
        procedimiento = GeografiaProcedimiento.objects.create(
            id_operativo='OP001',
            descripcion='Test with émojis: 🚓👮‍♂️ and ñññ',
            provincia='Neuquén'
        )
        
        self.assertIsNotNone(procedimiento.pk)
        self.assertEqual(procedimiento.provincia_key, 'neuquen')


@pytest.mark.django_db
class TestModelPerformance:
    """Performance tests for models using pytest"""
    
    def test_bulk_creation_performance(self):
        """Test bulk creation performance"""
        import time
        
        # Create 1000 procedimientos
        procedimientos = []
        for i in range(1000):
            procedimientos.append(GeografiaProcedimiento(
                id_operativo=f'OP{i:05d}',
                id_procedimiento=f'PROC{i:05d}',
                provincia='Buenos Aires',
                fecha='15/03/2025'
            ))
        
        start_time = time.time()
        GeografiaProcedimiento.objects.bulk_create(procedimientos)
        creation_time = time.time() - start_time
        
        # Should complete in reasonable time
        assert creation_time < 10  # Less than 10 seconds
        assert GeografiaProcedimiento.objects.count() == 1000
    
    def test_query_performance(self):
        """Test query performance with filtering"""
        import time
        
        # Create test data
        procedimientos = []
        for i in range(100):
            procedimientos.append(GeografiaProcedimiento(
                id_operativo=f'OP{i:05d}',
                provincia='Buenos Aires' if i % 2 == 0 else 'Córdoba',
                fecha_iso=date(2025, 1, 1)
            ))
        
        GeografiaProcedimiento.objects.bulk_create(procedimientos)
        
        # Test filtering performance
        start_time = time.time()
        filtered = list(GeografiaProcedimiento.objects.filter(
            provincia_key='buenos aires',
            fecha_iso__gte=date(2025, 1, 1)
        ))
        query_time = time.time() - start_time
        
        # Should query quickly
        assert query_time < 1  # Less than 1 second
        assert len(filtered) == 50  # Half the records