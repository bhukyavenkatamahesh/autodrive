{{- define "autodrive.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "autodrive.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "autodrive.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "autodrive.labels" -}}
app.kubernetes.io/name: {{ include "autodrive.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end -}}

{{- define "autodrive.image" -}}
{{- $registry := .root.Values.image.registry -}}
{{- if $registry -}}
{{ $registry }}/{{ .svc.image.repository }}:{{ .svc.image.tag }}
{{- else -}}
{{ .svc.image.repository }}:{{ .svc.image.tag }}
{{- end -}}
{{- end -}}
