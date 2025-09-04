from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import json


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('viewer', 'Viewer'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='dashboard_users',
        related_query_name='dashboard_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='dashboard_users',
        related_query_name='dashboard_user',
    )
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class OperationalData(models.Model):
    """
    Model to store operational data from Excel uploads
    """
    # Identification fields
    id_operativo = models.CharField(max_length=100, null=True, blank=True)
    id_procedimiento = models.CharField(max_length=100, null=True, blank=True)
    
    # Location and details
    fuerza_interviniente = models.CharField(max_length=100, null=True, blank=True)
    unidad_interviniente = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    tipo_intervencion = models.CharField(max_length=200, null=True, blank=True)
    
    # Geographic information
    provincia = models.CharField(max_length=100, null=True, blank=True)
    provincia_key = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    departamento_o_partido = models.CharField(max_length=100, null=True, blank=True)
    localidad = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    
    # Coordinates
    latitud = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Date and time
    fecha = models.CharField(max_length=50, null=True, blank=True)  # Original format
    fecha_iso = models.DateField(null=True, blank=True, db_index=True)  # Converted to ISO
    hora = models.CharField(max_length=20, null=True, blank=True)
    
    # Border security
    zona_seguridad_fronteras = models.CharField(max_length=100, null=True, blank=True)
    paso_fronterizo = models.CharField(max_length=100, null=True, blank=True)
    
    # Additional information
    otras_agencias_intervinientes = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    
    # Metadata
    hoja = models.CharField(max_length=100, null=True, blank=True, db_index=True)  # Excel sheet name
    archivo_original = models.CharField(max_length=200, null=True, blank=True)
    fecha_importacion = models.DateTimeField(auto_now_add=True)
    record_key = models.CharField(max_length=200, unique=True, db_index=True)
    
    # Additional data (for any extra fields)
    extra_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-fecha_importacion', 'fecha_iso']
        indexes = [
            models.Index(fields=['fecha_iso']),
            models.Index(fields=['provincia_key']),
            models.Index(fields=['hoja']),
            models.Index(fields=['record_key']),
        ]
    
    def __str__(self):
        return f"{self.id_operativo} - {self.descripcion[:50] if self.descripcion else 'N/A'}"
    
    def save(self, *args, **kwargs):
        # Generate provincia_key for filtering
        if self.provincia:
            self.provincia_key = self.normalize_provincia(self.provincia)
        
        # Parse fecha to fecha_iso
        if self.fecha and not self.fecha_iso:
            self.fecha_iso = self.parse_fecha(self.fecha)
            
        # Generate record_key if not provided
        if not self.record_key:
            self.record_key = f"{self.id_operativo or 'N/A'}_{self.id_procedimiento or 'N/A'}_{self.hoja or 'DEFAULT'}"
            
        super().save(*args, **kwargs)
    
    @staticmethod
    def normalize_provincia(provincia_name):
        """Normalize province name for filtering (same logic as Node.js)"""
        if not provincia_name:
            return ''
        
        import unicodedata
        
        # Convert to string and clean
        s = str(provincia_name).strip().replace(r'\s+', ' ')
        
        # Remove diacritics
        s = unicodedata.normalize('NFD', s)
        s = ''.join(char for char in s if unicodedata.category(char) != 'Mn')
        s = s.lower()
        
        # Handle CABA variations
        if s == 'caba' or 'ciudad autonoma' in s:
            return 'ciudad autonoma de buenos aires'
            
        return s
    
    @staticmethod
    def parse_fecha(fecha_str):
        """Parse fecha string to date object"""
        if not fecha_str or fecha_str.strip() in ['-', '']:
            return None
            
        try:
            # Try dd/mm/yyyy format first
            if '/' in fecha_str:
                day, month, year = fecha_str.split('/')
                return timezone.datetime(int(year), int(month), int(day)).date()
            
            # Try ISO format
            if '-' in fecha_str:
                parts = fecha_str.split('T')[0].split('-')  # Remove time part if present
                if len(parts) == 3:
                    year, month, day = parts
                    return timezone.datetime(int(year), int(month), int(day)).date()
            
        except (ValueError, IndexError):
            pass
            
        return None