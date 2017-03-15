#!/bin/bash
kubectl -n gridvo get svc | grep -q data-monitoring
if [ "$?" == "1" ];then
	kubectl create -f data_monitoring-service.yaml --record
	kubectl -n gridvo get svc | grep -q data-monitoring
	if [ "$?" == "0" ];then
		echo "data_monitoring-service install success!"
	else
		echo "data_monitoring-service install fail!"
	fi
else
	echo "data_monitoring-service is exist!"
fi
kubectl -n gridvo get pods | grep -q data-monitoring
if [ "$?" == "1" ];then
	kubectl create -f data_monitoring-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q data-monitoring
	if [ "$?" == "0" ];then
		echo "data_monitoring-deployment install success!"
	else
		echo "data_monitoring-deployment install fail!"
	fi
else
	kubectl delete -f data_monitoring-deployment.yaml
	kubectl -n gridvo get pods | grep -q data-monitoring
	while [ "$?" == "0" ]
	do
	kubectl -n gridvo get pods | grep -q data-monitoring
	done
	kubectl create -f data_monitoring-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q data-monitoring
	if [ "$?" == "0" ];then
		echo "data_monitoring-deployment update success!"
	else
		echo "data_monitoring-deployment update fail!"
	fi
fi
